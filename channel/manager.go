package channel

import (
	"chat/utils"
	"errors"
	"github.com/spf13/viper"
)

var ManagerInstance *Manager

func InitManager() {
	ManagerInstance = NewManager()
}

func NewManager() *Manager {
	var seq Sequence
	if err := viper.UnmarshalKey("channel", &seq); err != nil {
		panic(err)
	}

	// sort by priority

	manager := &Manager{
		Sequence:          seq,
		Models:            []string{},
		PreflightSequence: map[string]Sequence{},
	}
	manager.Init()

	return manager
}

func (m *Manager) Init() {
	// init support models
	for _, channel := range m.GetActiveSequence() {
		for _, model := range channel.GetModels() {
			if !utils.Contains(model, m.Models) {
				m.Models = append(m.Models, model)
			}
		}
	}

	// init preflight sequence
	for _, model := range m.Models {
		var seq Sequence
		for _, channel := range m.GetActiveSequence() {
			if utils.Contains(model, channel.GetModels()) {
				seq = append(seq, channel)
			}
		}
		seq.Sort()
		m.PreflightSequence[model] = seq
	}
}

func (m *Manager) GetSequence() Sequence {
	return m.Sequence
}

func (m *Manager) GetActiveSequence() Sequence {
	var seq Sequence
	for _, channel := range m.Sequence {
		if channel.GetState() {
			seq = append(seq, channel)
		}
	}
	seq.Sort()
	return seq
}

func (m *Manager) GetModels() []string {
	return m.Models
}

func (m *Manager) GetPreflightSequence() map[string]Sequence {
	return m.PreflightSequence
}

// HitSequence returns the preflight sequence of the model
func (m *Manager) HitSequence(model string) Sequence {
	return m.PreflightSequence[model]
}

// HasChannel returns whether the channel exists
func (m *Manager) HasChannel(model string) bool {
	return utils.Contains(model, m.Models)
}

func (m *Manager) GetTicker(model string) *Ticker {
	return &Ticker{
		Sequence: m.HitSequence(model),
	}
}

func (m *Manager) Len() int {
	return len(m.Sequence)
}

func (m *Manager) GetMaxId() int {
	var max int
	for _, channel := range m.Sequence {
		if channel.Id > max {
			max = channel.Id
		}
	}
	return max
}

func (m *Manager) SaveConfig() error {
	viper.Set("channel", m.Sequence)
	return viper.WriteConfig()
}

func (m *Manager) CreateChannel(channel *Channel) error {
	channel.Id = m.GetMaxId() + 1
	m.Sequence = append(m.Sequence, channel)
	return m.SaveConfig()
}

func (m *Manager) UpdateChannel(id int, channel *Channel) error {
	for i, item := range m.Sequence {
		if item.Id == id {
			m.Sequence[i] = channel
			return m.SaveConfig()
		}
	}
	return errors.New("channel not found")
}

func (m *Manager) DeleteChannel(id int) error {
	for i, item := range m.Sequence {
		if item.Id == id {
			m.Sequence = append(m.Sequence[:i], m.Sequence[i+1:]...)
			return m.SaveConfig()
		}
	}
	return errors.New("channel not found")
}

func (m *Manager) ActivateChannel(id int) error {
	for i, item := range m.Sequence {
		if item.Id == id {
			m.Sequence[i].State = true
			return m.SaveConfig()
		}
	}
	return errors.New("channel not found")
}

func (m *Manager) DeactivateChannel(id int) error {
	for i, item := range m.Sequence {
		if item.Id == id {
			m.Sequence[i].State = false
			return m.SaveConfig()
		}
	}
	return errors.New("channel not found")
}
