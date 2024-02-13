package channel

import (
	"chat/adapter"
	"chat/globals"
	"chat/utils"
	"fmt"
	"github.com/go-redis/redis/v8"
	"time"
)

func NewChatRequest(group string, props *adapter.ChatProps, hook globals.Hook) error {
	ticker := ConduitInstance.GetTicker(props.Model, group)
	if ticker == nil || ticker.IsEmpty() {
		return fmt.Errorf("cannot find channel for model %s", props.Model)
	}

	var err error
	for !ticker.IsDone() {
		if channel := ticker.Next(); channel != nil {
			props.MaxRetries = utils.ToPtr(channel.GetRetry())
			if err = adapter.NewChatRequest(channel, props, hook); err == nil || err.Error() == "signal" {
				return nil
			}

			globals.Warn(fmt.Sprintf("[channel] caught error %s for model %s at channel %s", err.Error(), props.Model, channel.GetName()))
		}
	}

	globals.Info(fmt.Sprintf("[channel] channels are exhausted for model %s", props.Model))
	return err
}

func PreflightCache(cache *redis.Client, hash string, buffer *utils.Buffer, hook globals.Hook) (int64, bool, error) {
	idx := utils.Intn64(globals.CacheAcceptedSize)
	key := fmt.Sprintf("chat-cache:%d:%s", idx, hash)

	raw, err := cache.Get(cache.Context(), key).Result()
	if err != nil {
		return idx, false, nil
	}

	buf, err := utils.UnmarshalString[utils.Buffer](raw)
	if err != nil {
		fmt.Println(err)
		return idx, false, nil
	}

	data := buf.Read()
	if data == "" {
		return idx, false, nil
	}

	buffer.SetToolCalls(buf.GetToolCalls())
	return idx, true, hook(data)
}

func StoreCache(cache *redis.Client, hash string, index int64, buffer *utils.Buffer) {
	key := fmt.Sprintf("chat-cache:%d:%s", index, hash)
	raw := utils.Marshal(buffer)
	expire := time.Duration(globals.CacheAcceptedExpire) * time.Second

	cache.Set(cache.Context(), key, raw, expire)
}

func NewChatRequestWithCache(cache *redis.Client, buffer *utils.Buffer, group string, props *adapter.ChatProps, hook globals.Hook) (bool, error) {
	hash := utils.Md5Encrypt(utils.Marshal(props))
	idx, hit, err := PreflightCache(cache, hash, buffer, hook)
	if hit {
		return true, err
	}

	if err = NewChatRequest(group, props, hook); err != nil {
		return false, err
	}

	StoreCache(cache, hash, idx, buffer)
	return false, nil
}
