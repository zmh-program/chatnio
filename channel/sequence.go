package channel

import "sort"

func (s *Sequence) Len() int {
	return len(*s)
}

func (s *Sequence) Less(i, j int) bool {
	return (*s)[i].GetPriority() > (*s)[j].GetPriority()
}

func (s *Sequence) Swap(i, j int) {
	(*s)[i], (*s)[j] = (*s)[j], (*s)[i]
}

func (s *Sequence) GetChannelById(id int) *Channel {
	for _, channel := range *s {
		if channel.Id == id {
			return channel
		}
	}
	return nil
}

func (s *Sequence) Sort() {
	// sort by priority
	sort.Sort(s)
}
