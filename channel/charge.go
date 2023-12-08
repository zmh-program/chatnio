package channel

import (
	"chat/globals"
	"chat/utils"
	"github.com/spf13/viper"
)

func NewChargeManager() *ChargeManager {
	var seq ChargeSequence
	if err := viper.UnmarshalKey("charge", &seq); err != nil {
		panic(err)
	}

	m := &ChargeManager{
		Sequence:         seq,
		Models:           map[string]*Charge{},
		NonBillingModels: []string{},
	}
	m.Load()

	return m
}

func (m *ChargeManager) Load() {
	// init support models
	m.Models = map[string]*Charge{}
	for _, charge := range m.Sequence {
		for _, model := range charge.Models {
			if _, ok := m.Models[model]; !ok {
				m.Models[model] = charge
			}
		}
	}

	m.NonBillingModels = []string{}
	for _, charge := range m.Sequence {
		if !charge.IsBilling() {
			for _, model := range charge.Models {
				m.NonBillingModels = append(m.NonBillingModels, model)
			}
		}
	}
}

func (m *ChargeManager) GetModels() map[string]*Charge {
	return m.Models
}

func (m *ChargeManager) GetNonBillingModels() []string {
	return m.NonBillingModels
}

func (m *ChargeManager) IsBilling(model string) bool {
	return !utils.Contains(model, m.NonBillingModels)
}

func (m *ChargeManager) GetCharge(model string) Charge {
	if charge, ok := m.Models[model]; ok {
		return *charge
	}
	return Charge{
		Type:      globals.NonBilling,
		Anonymous: false,
	}
}

func (m *ChargeManager) SaveConfig() error {
	viper.Set("charge", m.Sequence)
	m.Load()
	return viper.WriteConfig()
}

func (m *ChargeManager) GetMaxId() int {
	max := 0
	for _, charge := range m.Sequence {
		if charge.Id > max {
			max = charge.Id
		}
	}
	return max
}

func (m *ChargeManager) AddRule(charge Charge) error {
	charge.Id = m.GetMaxId() + 1
	m.Sequence = append(m.Sequence, &charge)
	return m.SaveConfig()
}

func (m *ChargeManager) UpdateRule(charge Charge) error {
	for _, item := range m.Sequence {
		if item.Id == charge.Id {
			*item = charge
			break
		}
	}
	return m.SaveConfig()
}

func (m *ChargeManager) SetRule(charge Charge) error {
	if charge.Id == -1 {
		return m.AddRule(charge)
	}
	return m.UpdateRule(charge)
}

func (m *ChargeManager) DeleteRule(id int) error {
	for i, item := range m.Sequence {
		if item.Id == id {
			m.Sequence = append(m.Sequence[:i], m.Sequence[i+1:]...)
			break
		}
	}
	return m.SaveConfig()
}

func (m *ChargeManager) ListRules() ChargeSequence {
	return m.Sequence
}

func (m *ChargeManager) GetRule(id int) *Charge {
	for _, item := range m.Sequence {
		if item.Id == id {
			return item
		}
	}
	return nil
}

func (c *Charge) GetType() string {
	if c.Type == "" {
		return globals.NonBilling
	}
	return c.Type
}

func (c *Charge) GetModels() []string {
	return c.Models
}

func (c *Charge) GetInput() float32 {
	if c.Input <= 0 {
		return 0
	}
	return c.Input
}

func (c *Charge) GetOutput() float32 {
	if c.Output <= 0 {
		return 0
	}
	return c.Output
}

func (c *Charge) SupportAnonymous() bool {
	return c.Anonymous
}

func (c *Charge) IsBilling() bool {
	return c.GetType() != globals.NonBilling
}

func (c *Charge) IsBillingType(t string) bool {
	return c.GetType() == t
}

func (c *Charge) GetLimit() float32 {
	switch c.GetType() {
	case globals.NonBilling:
		return 0
	case globals.TimesBilling:
		return c.GetOutput()
	case globals.TokenBilling:
		// 1k input tokens + 1k output tokens
		return c.GetInput() + c.GetOutput()
	default:
		return 0
	}
}
