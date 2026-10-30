<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center p-6">
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-8 max-w-md w-full text-center">
        <h1 class="text-xl font-bold text-slate-900 mb-2">{{ $title }}</h1>
        <p class="text-slate-600 text-sm leading-relaxed mb-6">{{ $message }}</p>
        <span class="text-xs text-slate-400">GreenFleet Management System</span>
    </div>
</body>
</html>