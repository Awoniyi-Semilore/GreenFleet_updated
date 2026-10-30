<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\AuthService;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {}

    /**
     * Standard traditional username/password login.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful.',
            'data' => [
                'token' => $result['token'],
                'user' => $result['user'],
            ]
        ]);
    }

    /**
     * Redirects the user frontend target towards Microsoft Identity platform.
     */
    public function redirectToMicrosoft(): JsonResponse
    {
        $tenantId = config('services.azure.tenant_id');
        $clientId = config('services.azure.client_id');
        $redirectUri = config('services.azure.redirect');
        
        $state = Str::random(40);
        session(['oauth_state' => $state]);

        $url = "https://login.microsoftonline.com/{$tenantId}/oauth2/v2.0/authorize?" . http_build_query([
            'client_id' => $clientId,
            'response_type' => 'code',
            'redirect_uri' => $redirectUri,
            'response_mode' => 'query',
            'scope' => 'openid profile email User.Read',
            'state' => $state,
        ]);

        return response()->json([
            'status' => 'success',
            'url' => $url
        ]);
    }

    /**
     * Handles the callback code from Azure, queries Graph API, and provisions tokens.
     */
    public function handleMicrosoftCallback(Request $request)
    {
        $code = $request->get('code');
        $tenantId = config('services.azure.tenant_id');
        
        if (!$code) {
            return redirect(env('FRONTEND_URL') . '/login?error=missing_code');
        }

        // 1. Exchange Auth Code for Access Token
        $tokenResponse = Http::asForm()->post("https://login.microsoftonline.com/{$tenantId}/oauth2/v2.0/token", [
            'client_id' => config('services.azure.client_id'),
            'client_secret' => config('services.azure.client_secret'),
            'code' => $code,
            'redirect_uri' => config('services.azure.redirect'),
            'grant_type' => 'authorization_code',
        ]);

        if ($tokenResponse->failed()) {
            Log::error('Azure Auth Token Exchange Failed', ['res' => $tokenResponse->body()]);
            return redirect(env('FRONTEND_URL') . '/login?error=token_exchange_failed');
        }

        $accessToken = $tokenResponse->json()['access_token'];

        // 2. Identify resource properties via Microsoft Graph
        $userResponse = Http::withToken($accessToken)->get('https://graph.microsoft.com/v1.0/me');
        
        if ($userResponse->failed()) {
            return redirect(env('FRONTEND_URL') . '/login?error=profile_fetch_failed');
        }

        $graphUser = $userResponse->json();
        $email = $graphUser['mail'] ?? $graphUser['userPrincipalName'];
        
        // 3. Authenticate or create the local user record
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $staffRole = Role::where('name', 'Staff')->first();
            
            // Format fallback usernames based on first/last name fields
            $username = strtolower(($graphUser['givenName'] ?? 'user') . '.' . ($graphUser['surname'] ?? 'name'));
            
            $user = User::create([
                'username' => $username,
                'email' => $email,
                'first_name' => $graphUser['givenName'] ?? 'Employee',
                'last_name' => $graphUser['surname'] ?? 'Member',
                'role_id' => $staffRole ? $staffRole->id : 1,
                'status' => 'ACTIVE',
                'password' => bcrypt(Str::random(24)), // Dummy random password
            ]);
        }

        if ($user->status !== 'ACTIVE') {
            return redirect(env('FRONTEND_URL') . '/login?error=account_disabled');
        }

        // 4. Issue standard API Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;
        
        // 5. Safely redirect directly back to the SPA frontend client
        return redirect(env('FRONTEND_URL') . "/login?sso_token={$token}");
    }

    /**
 * Direct Line Manager Email Action: Approve
 */
public function approveFromEmail(int $id)
{
    $transportRequest = \App\Models\TransportRequest::findOrFail($id);

    // Prevent double processing states
    if ($transportRequest->status !== 'PENDING') {
        return response()->view('responses.message', ['title' => 'Already Processed', 'message' => 'This request has already been handled and is currently: ' . $transportRequest->status]);
    }

    // Set state to LINE_APPROVED so it officially surfaces on the Transport Admin's dashboard queue
    $transportRequest->update(['status' => 'LINE_APPROVED']);

    // Log the audit footprint inside your approvals mapping table
    $transportRequest->approvals()->create([
        'status' => 'APPROVED',
        'remarks' => 'Approved via automated Line Manager Email Gateway.',
    ]);

    return response()->view('responses.message', ['title' => 'Request Approved', 'message' => 'Thank you! The request has been verified and forwarded to the Transport Administration team for vehicle/driver assignment.']);
}

/**
 * Direct Line Manager Email Action: Reject
 */
    public function rejectFromEmail(int $id)
    {
        $transportRequest = \App\Models\TransportRequest::findOrFail($id);

        if ($transportRequest->status !== 'PENDING') {
            return response()->view('responses.message', ['title' => 'Already Processed', 'message' => 'This request has already been handled and is currently: ' . $transportRequest->status]);
        }

        // Set state directly to REJECTED. 
        $transportRequest->update(['status' => 'REJECTED']);

        $transportRequest->approvals()->create([
            'status' => 'REJECTED',
            'remarks' => 'Rejected via automated Line Manager Email Gateway.',
        ]);

        return response()->view('responses.message', ['title' => 'Request Rejected', 'message' => 'The transport request has been rejected. It has been archived and will not surface on the Transport Admin dashboard.']);
    }
}