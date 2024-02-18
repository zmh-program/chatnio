package globals

func (c *Chunk) IsEmpty() bool {
	return len(c.Content) == 0 && c.ToolCall == nil && c.FunctionCall == nil
}
