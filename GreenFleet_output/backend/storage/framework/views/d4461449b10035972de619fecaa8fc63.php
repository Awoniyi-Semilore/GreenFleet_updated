<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title><?php echo e($success ? 'Action Completed' : 'Action Failed'); ?> — GreenFleet</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: #f5f7f5;
            font-family: Arial, Helvetica, sans-serif;
            color: #17221b;
        }

        .card {
            width: 100%;
            max-width: 520px;
            background: #ffffff;
            border-radius: 20px;
            padding: 42px 36px;
            text-align: center;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
        }

        .icon {
            width: 72px;
            height: 72px;
            margin: 0 auto 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 34px;
            font-weight: bold;
        }

        .success {
            background: #e8f7ed;
            color: #16803c;
        }

        .error {
            background: #fdecec;
            color: #c62828;
        }

        .logo {
            font-size: 18px;
            font-weight: 700;
            color: #16803c;
            margin-bottom: 28px;
            letter-spacing: 0.3px;
        }

        h1 {
            margin: 0 0 12px;
            font-size: 25px;
            line-height: 1.3;
        }

        p {
            margin: 0 auto;
            max-width: 420px;
            color: #66736b;
            font-size: 15px;
            line-height: 1.7;
        }

        .request-id {
            margin-top: 22px;
            padding: 12px 16px;
            background: #f5f7f5;
            border-radius: 10px;
            color: #4f5d54;
            font-size: 13px;
        }

        .button {
            display: inline-block;
            margin-top: 28px;
            padding: 12px 22px;
            background: #16803c;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
        }

        .button:hover {
            background: #126b32;
        }
    </style>
</head>

<body>

<div class="card">

    <div class="logo">
        GreenFleet
    </div>

    <?php if($success): ?>

        <div class="icon success">
            ✓
        </div>

        <h1><?php echo e($title); ?></h1>

        <p>
            <?php echo e($message); ?>

        </p>

        <?php if($requestId): ?>
            <div class="request-id">
                Request <strong>#<?php echo e($requestId); ?></strong>
            </div>
        <?php endif; ?>

        <a
            href="<?php echo e(env('FRONTEND_URL', 'http://localhost:5173')); ?>"
            class="button"
        >
            Go to GreenFleet
        </a>

    <?php else: ?>

        <div class="icon error">
            !
        </div>

        <h1><?php echo e($title); ?></h1>

        <p>
            <?php echo e($message); ?>

        </p>

        <?php if($requestId): ?>
            <div class="request-id">
                Request <strong>#<?php echo e($requestId); ?></strong>
            </div>
        <?php endif; ?>

    <?php endif; ?>

</div>

</body>
</html><?php /**PATH C:\Users\semilore.awoniyi\Desktop\GreenFleet_updated\GreenFleet_output\backend\resources\views/public/request-action.blade.php ENDPATH**/ ?>