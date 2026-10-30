<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title><?php echo new \Illuminate\Support\EncodedHtmlString(config('app.name', 'GreenFleet')); ?></title>

    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f7f5;
            font-family: Arial, Helvetica, sans-serif;
            color: #17221b;
        }

        .wrapper {
            width: 100%;
            padding: 40px 20px;
            box-sizing: border-box;
        }

        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
        }

        .header {
            padding: 26px 32px;
            background: #ffffff;
            border-bottom: 1px solid #e8ece9;
        }

        .brand {
            text-decoration: none;
        }

        .brand-icon {
            display: inline-block;
            width: 36px;
            height: 36px;
            line-height: 36px;
            text-align: center;
            border-radius: 10px;
            background: #16803c;
            color: #ffffff;
            font-size: 18px;
            font-weight: 700;
            vertical-align: middle;
        }

        .brand-name {
            display: inline-block;
            margin-left: 10px;
            color: #16803c;
            font-size: 20px;
            font-weight: 700;
            vertical-align: middle;
        }

        .content {
            padding: 36px 32px;
        }

        .content h1 {
            color: #17221b;
            font-size: 24px;
            margin-top: 0;
            margin-bottom: 20px;
        }

        .content p {
            color: #56635b;
            font-size: 15px;
            line-height: 1.7;
            margin: 0 0 16px;
        }

        .content strong {
            color: #17221b;
        }

        .button {
            display: inline-block;
            padding: 12px 20px;
            margin: 10px 0;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
        }

        .footer {
            padding: 24px 32px;
            background: #f8faf8;
            border-top: 1px solid #e8ece9;
            text-align: center;
        }

        .footer p {
            margin: 0 0 6px;
            color: #89938d;
            font-size: 12px;
            line-height: 1.6;
        }

        @media only screen and (max-width: 600px) {
            .wrapper {
                padding: 20px 10px;
            }

            .header,
            .content,
            .footer {
                padding-left: 22px;
                padding-right: 22px;
            }
        }
    </style>
</head>

<body>

<div class="wrapper">

    <div class="container">

        <div class="header">
            <a href="<?php echo new \Illuminate\Support\EncodedHtmlString(config('app.url')); ?>" class="brand">
                <span class="brand-icon">G</span>
                <span class="brand-name">GreenFleet</span>
            </a>
        </div>

        <div class="content">
            <?php echo $__env->yieldContent('content'); ?>
        </div>

        <div class="footer">
            <p>
                This is an automated message from GreenFleet Transport Operations. Please do not reply to this email.
            </p>

            <p>
                © <?php echo new \Illuminate\Support\EncodedHtmlString(date('Y')); ?> Greenwich Merchant Bank. All rights reserved.
            </p>
        </div>

    </div>

</div>

</body>
</html>
<?php /**PATH C:\Users\semilore.awoniyi\Desktop\GreenFleet_updated\GreenFleet_output\backend\resources\views/emails/layouts/greenfleet.blade.php ENDPATH**/ ?>