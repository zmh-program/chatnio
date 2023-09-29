package web

import (
	"chat/utils"
	"golang.org/x/net/html"
	"regexp"
	"strings"
)

var unexpected = []string{
	"<cite>",
	"<span class=\"sb_count\">",
	"<div class=\"ntf_label toggle_label nt_tit\" id=\"ntf_newtabfil_label\">",
	"<img role=\"presentation\"",
}

func ParseBing(source string) string {
	body := SplitPagination(GetMainBody(source))
	res := strings.Join(GetContent(body), " ")
	return html.UnescapeString(res)
}

func GetMainBody(html string) string {
	suf := utils.TryGet(strings.Split(html, "<main aria-label=\"搜尋結果\">"), 1)
	return strings.Split(suf, "</main>")[0]
}

func SplitPagination(html string) string {
	pre := strings.Split(html, "<li class=\"b_msg b_canvas\">")[0]
	return utils.TryGet(strings.Split(pre, "<div class=\"ntf_label toggle_label nt_tit\" id=\"ntf_newtabfil_label\">在新选项卡中打开链接</div>"), 1)
}

func GetContent(html string) []string {
	re := regexp.MustCompile(`>([^<]+)<`)
	matches := re.FindAllString(html, -1)

	return FilterContent(matches)
}

func IsExpected(data string) bool {
	if IsLink(data) {
		return false
	}
	for _, str := range unexpected {
		if strings.HasPrefix(data, str) {
			return false
		}
	}
	return true
}

func IsLink(input string) bool {
	re := regexp.MustCompile(`^(https?|ftp):\/\/[^\s/$.?#].\S*$`)
	return re.MatchString(input)
}

func FilterContent(matches []string) []string {
	res := make([]string, 0)

	for _, match := range matches {
		source := strings.TrimSpace(match[1 : len(match)-1])
		if len(source) > 0 && IsExpected(source) {
			res = append(res, source)
		}
	}

	return res
}
