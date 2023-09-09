<?php
include 'utils.php';

$dark = get('theme', 'light') === 'dark';
$message = get('message', 'hi');
$web = get('web', 'false') === 'false';
$sign = get('sign', 'false') === 'true';

$resp = fetch($message, $web);
if (!$resp) {
    include 'error.php';
    exit;
}

$msg = str_replace("&hellip;", "-",
    str_replace("<br>", "<br></br>", $resp['message']));
$msgHeight = substr_count($resp['message'], "\n") * 20 + strlen($msg) * 0.15 + substr_count($resp['message'], "<img src=") * 320 + 20;
$height = 90 + $msgHeight;

$header = $dark ? "#fff" : "#0a0a0a";
$background = $dark ? "#000" : "#fffefe";

ob_start('compress');
?>
    <svg width="580" viewBox="0 0 420 <?php echo $height + 1 ?>" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-labelledby="descId">
        <title id="titleId">ChatGPT</title>
        <desc id="descId">ChatGPT Card</desc>
        <style>
            .header {
                font: 600 26px 'Segoe UI', Ubuntu, Sans-Serif !important;
                animation: fadeInAnimation 0.8s ease-in-out forwards;
            }
            .openai {
                fill: <?php echo $header ?>;
            }
            @supports (appearance: auto) {
                .header {
                    font-size: 16px;
                }
            }
            .stat {
                font: 600 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif;
                fill: <?php echo $header ?>;
            }
            @supports (appearance: auto) {
                .stat {
                    font-size: 12px;
                }
            }
            .stagger {
                opacity: 0;
                animation: fadeInAnimation 0.3s ease-in-out forwards;
            }
            .object {
                width: calc(100% - 64px);
            }
            @keyframes fadeInAnimation {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
        </style>
        <rect data-testid="card-bg" x="0.5" y="0.5" rx="4.5" height="99%" stroke="#e4e2e2" width="99%" fill="<?php echo $background ?>" stroke-opacity="1"/>
        <g data-testid="card-title" transform="translate(30, 25)">
            <?php if ($sign) { ?>
            <g class="stagger" transform="translate(0, 0)">
                <text class="stat" x="330" y="-2">chatnio</text>
            </g>
            <?php } ?>
            <g transform="translate(0, 0)">
                <svg class="openai" width="20" height="20" y="6" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>OpenAI</title><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>
                <text x="28" y="24" class="stat header" data-testid="question"><?php echo $message ?></text>
            </g>
        </g>
        <g data-testid="main-card" transform="translate(0, 48)">
            <svg x="0" y="0">
                <g transform="translate(0, 0)">
                    <g class="stagger" style="animation-delay: 600ms">
                        <foreignObject class="stat object" x="30" y="10" height="<?php echo $msgHeight ?>" data-testid="message">
                            <style>
                                .data * {
                                    font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif;
                                    font-weight: normal;
                                    color: <?php echo $header ?>;
                                }
                                .data h1, .data h2, .data h3 {
                                    font-weight: bold;
                                }

                                .data img {
                                    height: 180px;
                                }
                            </style>
                            <body xmlns="http://www.w3.org/1999/xhtml" class="data">
                            <?php echo $msg ?>
                            </body>
                        </foreignObject>
                    </g>
                </g>
            </svg>
        </g>
    </svg>

<?php
ob_end_flush();
?>