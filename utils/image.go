package utils

import (
	"chat/globals"
	"fmt"
	"github.com/chai2010/webp"
	"image"
	"image/gif"
	"image/jpeg"
	"io"
	"math"
	"net/http"
	"os"
	"path"
	"strings"
)

type Image struct {
	Object image.Image
}
type Images []Image

func NewImage(url string) (*Image, error) {
	if strings.HasPrefix(url, "data:image/") {
		data := SafeSplit(url, ",", 2)
		if data[1] == "" {
			return nil, nil
		}

		decoded, err := Base64Decode(data[1])
		if err != nil {
			return nil, err
		}

		img, _, err := image.Decode(strings.NewReader(string(decoded)))
		if err != nil {
			return nil, err
		}

		return &Image{Object: img}, nil
	}

	res, err := http.Get(url)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	var img image.Image
	suffix := strings.ToLower(path.Ext(url))
	switch suffix {
	case ".png":
		if img, _, err = image.Decode(res.Body); err != nil {
			return nil, err
		}
	case ".jpg", ".jpeg":
		if img, err = jpeg.Decode(res.Body); err != nil {
			return nil, err
		}
	case "webp":
		if img, err = webp.Decode(res.Body); err != nil {
			return nil, err
		}
	case "gif":
		ticks, err := gif.DecodeAll(res.Body)
		if err != nil {
			return nil, err
		}
		img = ticks.Image[0]
	}

	return &Image{Object: img}, nil
}

func ConvertToBase64(url string) (string, error) {
	if strings.HasPrefix(url, "data:image/") {
		data := strings.Split(url, ",")
		if len(data) != 2 {
			return "", nil
		}
		return data[1], nil
	}

	res, err := http.Get(url)
	if err != nil {
		return "", err
	}

	defer res.Body.Close()

	data, err := io.ReadAll(res.Body)
	if err != nil {
		return "", err
	}

	return Base64EncodeBytes(data), nil
}

func (i *Image) GetWidth() int {
	return i.Object.Bounds().Max.X
}

func (i *Image) GetHeight() int {
	return i.Object.Bounds().Max.Y
}

func (i *Image) GetPixel(x int, y int) (uint32, uint32, uint32, uint32) {
	return i.Object.At(x, y).RGBA()
}

func (i *Image) GetPixelColor(x int, y int) (int, int, int) {
	r, g, b, _ := i.GetPixel(x, y)
	return int(r), int(g), int(b)
}

func (i *Image) CountTokens(model string) int {
	if globals.IsVisionModel(model) {
		// tile size is 512x512
		// the max size of image is 2048x2048
		// the image that is larger than 2048x2048 will be resized in 16 tiles

		x := LimitMax(math.Ceil(float64(i.GetWidth())/512), 4)
		y := LimitMax(math.Ceil(float64(i.GetHeight())/512), 4)
		tiles := int(x) * int(y)

		return 85 + 170*tiles
	}

	return 0
}

func DownloadImage(url string, path string) error {
	res, err := http.Get(url)
	if err != nil {
		return err
	}

	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			globals.Debug("[utils] close file error: %s (path: %s)", err.Error(), path)
		}
	}(res.Body)

	file, err := os.Create(path)
	if err != nil {
		return err
	}

	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			globals.Debug("[utils] close file error: %s (path: %s)", err.Error(), path)
		}
	}(file)

	_, err = io.Copy(file, res.Body)
	return err
}

func StoreImage(url string) string {
	if globals.AcceptImageStore {
		hash := Md5Encrypt(url)

		if err := DownloadImage(url, fmt.Sprintf("storage/attachments/%s", hash)); err != nil {
			globals.Warn(fmt.Sprintf("[utils] save image error: %s", err.Error()))
			return url
		}

		return fmt.Sprintf("%s/attachments/%s", globals.NotifyUrl, hash)
	}

	return url
}
