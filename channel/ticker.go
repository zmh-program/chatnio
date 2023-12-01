package channel

import "chat/utils"

func (t *Ticker) GetChannelByPriority(priority int) *Channel {
	var stack Sequence

	for idx, channel := range t.Sequence {
		if channel.GetPriority() == priority {
			// get if the next channel has the same priority
			if idx+1 < len(t.Sequence) && t.Sequence[idx+1].GetPriority() == priority {
				stack = append(stack, channel)
				continue
			}

			if len(stack) == 0 {
				return channel
			}

			// stack is not empty
			stack = append(stack, channel)

			// sort by weight and break the loop
			if idx+1 >= len(t.Sequence) || t.Sequence[idx+1].GetPriority() != priority {
				stack.Sort()
				break
			}
		}
	}

	weight := utils.Each(stack, func(channel *Channel) int {
		return channel.GetWeight()
	})
	total := utils.Sum(weight)

	// get random number
	cursor := utils.Intn(total)

	// get channel by weight
	for _, channel := range stack {
		cursor -= channel.GetWeight()
		if cursor < 0 {
			return channel
		}
	}

	return stack[0]
}

func (t *Ticker) Next() *Channel {
	if t.Cursor >= len(t.Sequence) {
		// out of sequence
		return nil
	}

	priority := t.Sequence[t.Cursor].GetPriority()
	channel := t.GetChannelByPriority(priority)
	t.SkipPriority(priority)

	return channel
}

func (t *Ticker) SkipPriority(priority int) {
	for idx, channel := range t.Sequence {
		if channel.GetPriority() == priority {
			// get if the next channel does not have the same priority or out of sequence
			if idx+1 >= len(t.Sequence) || t.Sequence[idx+1].GetPriority() != priority {
				t.Cursor = idx + 1
				break
			}
		}
	}
}

func (t *Ticker) Skip() {
	t.Cursor++
}

func (t *Ticker) IsDone() bool {
	return t.Cursor >= len(t.Sequence)
}
