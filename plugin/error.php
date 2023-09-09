<?php
include_once 'utils.php';
$dark = isset($_GET['theme']) && $_GET['theme'] === 'dark';

$header = $dark ? "#fff" : "#434d58";
$background = $dark ? "#000" : "#fffefe";

ob_start('compress');
?>

    <svg width="540" viewBox="0 0 660 216" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="descId">
        <title id="titleId">Error</title>
        <desc id="descId">Error Card</desc>
        <style>
            .header {
                font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
                fill: <?php echo $header ?>;
                animation: fadeInAnimation 0.8s ease-in-out forwards
            }
            @supports(appearance: auto) {
                .header {
                    font-size: 16px
                }
            }
            #rect-mask rect {
                animation: fadeInAnimation 1s ease-in-out forwards
            }
            @keyframes fadeInAnimation {
                from {
                    opacity: 0
                }
                to {
                    opacity: 1
                }
            }
        </style>
        <rect data-testid="card-bg" x="0.5" y="0.5" rx="4.5" height="99%" stroke="#e4e2e2" width="659" fill="<?php echo $background; ?>" stroke-opacity="1"/>
        <g data-testid="card-title" transform="translate(200, 108)">
            <g transform="translate(0, 0)">
                <text x="0" y="0" class="header" data-testid="header">Sorry, there is something wrong...</text>
            </g>
        </g>
    </svg>

<?php
ob_end_flush();
?>