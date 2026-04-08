<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Http;

// Models
use App\Models\Membre;
use App\Models\Publication;
use App\Models\Project;

// Auth Controllers
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\Auth\VerifyEmailController;

// API Controllers
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MembreController;
use App\Http\Controllers\Api\AdminMembreController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\PublicationController;
use App\Http\Controllers\Api\ThemeRechercheController;
use App\Http\Controllers\Api\AxeController;
use App\Http\Controllers\Api\AxeMembreController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\GallerieController;
use App\Http\Controllers\Api\PartenaireController;
use App\Http\Controllers\Api\MotDirecteurController;
use App\Http\Controllers\Api\HistoireController;
use App\Http\Controllers\Api\ProjetFinanceController;
use App\Http\Controllers\Api\ProjetIncubeController;
use App\Http\Controllers\Api\PrixDistinctionController;
use App\Http\Controllers\Api\ActivityReportController;
use App\Http\Controllers\Api\ProjectController;

/*
|-------------------------------------------------------------------------
| Routes API
|-------------------------------------------------------------------------
| Ce fichier contient toutes les routes de l'API (publiques, protégées,
| admin). Elles sont organisées en 3 sections principales pour une
| meilleure clarté et maintenance.
*/

/* ----------------------------------------------------------------------
| Authentification & Sécurité
---------------------------------------------------------------------- */

// Authentification sociale (Google)
Route::get('auth/google/redirect', [SocialAuthController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);

// CSRF pour Sanctum
Route::get('/sanctum/csrf-cookie', fn () => response()->json(['message' => 'CSRF cookie set']));

// Requête OPTIONS (preflight CORS)
Route::options('{any}', fn (Request $request) => response('', 200)
    ->header('Access-Control-Allow-Origin', $request->header('Origin') ?: 'http://localhost:5173')
    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, X-XSRF-TOKEN')
    ->header('Access-Control-Allow-Credentials', 'true')
)->where('any', '.*');

/* ----------------------------------------------------------------------
| Authentification Utilisateur (publique)
---------------------------------------------------------------------- */

Route::middleware([StartSession::class, 'throttle:6,1'])->group(function () {
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
    Route::post('/register', [RegisteredUserController::class, 'store']);
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store']);
    Route::post('/reset-password', [NewPasswordController::class, 'store']);
});

// Vérification de l'e-mail
Route::get('/verify-email/{id}/{hash}', [VerifyEmailController::class, '__invoke'])
    ->middleware(['signed'])
    ->name('verification.verify');

/* ----------------------------------------------------------------------
| Routes PUBLIQUES (lecture seule uniquement)
---------------------------------------------------------------------- */

// Axes et membres par axe
Route::prefix('axes')->group(function () {
    Route::get('/', [AxeController::class, 'index']);
    Route::get('/{axe}', [AxeController::class, 'show']);
    Route::get('/{axe}/membres', [AxeController::class, 'getMembresByPosition']);
});

// Membres publics
Route::prefix('membres')->group(function () {
    Route::get('/', [MembreController::class, 'index']);
    Route::get('/{membre}', [MembreController::class, 'showPublic']);
});

// Publications (lecture seule)
Route::prefix('publications')->group(function () {
    Route::get('/', [PublicationController::class, 'index']);
    Route::get('/{publication}', [PublicationController::class, 'show']);
});

// Projets (lecture seule) - UNIQUEMENT "projects" en public
Route::prefix('projects')->group(function () {
    Route::get('/', [ProjectController::class, 'index']);
    Route::get('/{project}', [ProjectController::class, 'show']);
});

// Prix et distinctions (lecture seule uniquement)
Route::prefix('prix-distinctions')->group(function () {
    Route::get('/', [PrixDistinctionController::class, 'index']);
    Route::get('/{prix_distinction}', [PrixDistinctionController::class, 'show']);
});

// Rapports d'activités (lecture seule)
Route::prefix('activity-reports')->group(function () {
    Route::get('/', [ActivityReportController::class, 'index']);
    Route::get('/{activityReport}', [ActivityReportController::class, 'show']);
});

// Partenaires
Route::prefix('partenaires')->group(function () {
    Route::get('/', [PartenaireController::class, 'index']);
});

// Paramètres, statistiques, contact, comités, pages statiques
Route::get('/stats', [DashboardController::class, 'publicStats']);
Route::get('/pages/{page}/settings', [SettingsController::class, 'index']);
Route::get('/membres-comite', [AdminMembreController::class, 'getComite']);
Route::post('/contact', [ContactController::class, 'store']);

// Galeries
Route::prefix('galleries')->group(function () {
    Route::get('/', [GallerieController::class, 'getGalleries']);
    Route::get('/entity', [GallerieController::class, 'index']);
    Route::get('/{id}', [GallerieController::class, 'show']);
});

/* ----------------------------------------------------------------------
| Routes PROTÉGÉES (authentification requise)
---------------------------------------------------------------------- */

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => response()->json([
        'user' => $request->user()->load(['roles', 'membre']),
        'type' => $request->user()->roles->pluck('name')->contains('admin') ? 'admin' : 'membre',
    ]));

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);

    Route::prefix('membre')->group(function () {
        Route::get('/', [MembreController::class, 'show']);
        Route::put('/', [MembreController::class, 'update']);
    });

    Route::post('/pages/{page}/settings', [SettingsController::class, 'updatePost']);

    Route::get('/membres/profile', [MembreController::class, 'profile']);
    Route::put('/membres/profile', [MembreController::class, 'updateProfile']);

    Route::get('/membres/{membre}/publications', [PublicationController::class, 'byMembre']);
    Route::get('/membres/{membre}/prix-distinctions', [PrixDistinctionController::class, 'byMembre']);

    Route::get('/proxy-image', function (Request $request) {
        $url = $request->get('url');
        if (!$url) return response()->json(['error' => 'URL parameter is required'], 400);
        try {
            $response = Http::timeout(10)->get($url);
            if ($response->successful()) {
                return response($response->body())
                    ->header('Content-Type', $response->header('Content-Type'))
                    ->header('Cache-Control', 'public, max-age=3600');
            }
        } catch (\Exception $e) {
            $fallback = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
            return response($fallback)->header('Content-Type', 'image/png');
        }
        return response()->json(['error' => 'Failed to fetch image'], 500);
    });
});

/* ----------------------------------------------------------------------
| Routes ADMIN (auth + rôle:admin)
---------------------------------------------------------------------- */

Route::middleware(['auth:sanctum', 'role:admin', 'throttle:120,1'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Projets admin (toutes les méthodes REST) - TABLE projects
    Route::apiResource('projects', ProjectController::class);

    Route::resource('membres', AdminMembreController::class);
    Route::post('membres/{membre}/toggle-comite', [AdminMembreController::class, 'toggleComite']);

    Route::get('axe-membre', [AxeMembreController::class, 'index']);
    Route::apiResource('axes', AxeController::class);
    Route::post('axes/{axe}/membres', [AxeController::class, 'addMembre']);
    Route::delete('axes/{axe}/membres/{membre}', [AxeController::class, 'removeMembre']);
    Route::put('axes/{axe}/membres/{membre}/position', [AxeController::class, 'updateMembrePosition']);

    Route::apiResource('projet-finances', ProjetFinanceController::class);
    Route::get('projects/{projectId}/finances', [ProjetFinanceController::class, 'byProject']);
    Route::apiResource('projet-incubes', ProjetIncubeController::class);
    Route::get('projects/{projectId}/incubes', [ProjetIncubeController::class, 'byProject']);

    Route::apiResource('publications', PublicationController::class);
    Route::apiResource('partenaires', PartenaireController::class);
    Route::apiResource('histoire', HistoireController::class);
    Route::apiResource('mot-directeur', MotDirecteurController::class);

    Route::apiResource('prix-distinctions', PrixDistinctionController::class);
    Route::get('prix-distinctions/membres/{membreId}', [PrixDistinctionController::class, 'byMembre']);

    Route::prefix('users')->group(function () {
        Route::get('/', [AdminUserController::class, 'index']);
        Route::get('/{id}', [AdminUserController::class, 'show']);
        Route::put('/{id}', [AdminUserController::class, 'update']);
        Route::delete('/{id}', [AdminUserController::class, 'destroy']);
        Route::post('/', [UserController::class, 'store']);

        Route::post('{user}/approve', [AdminUserController::class, 'approve']);
        Route::post('{user}/reject', [AdminUserController::class, 'reject']);
        Route::post('{user}/block', [AdminUserController::class, 'block']);
        Route::post('{user}/unblock', [AdminUserController::class, 'unblock']);
    });

    Route::prefix('contact')->group(function () {
        Route::get('/messages', [ContactController::class, 'index']);
        Route::patch('/messages/{id}/toggle-read', [ContactController::class, 'toggleRead']);
        Route::delete('/messages/{id}', [ContactController::class, 'destroy']);
    });

    Route::prefix('galleries')->group(function () {
        Route::get('/', [GallerieController::class, 'allGalleries']);
        Route::get('/{id}', [GallerieController::class, 'show']);
        Route::post('/', [GallerieController::class, 'store']);
        Route::put('/{id}', [GallerieController::class, 'update']);
        Route::delete('/{id}', [GallerieController::class, 'destroy']);
    });

    // Routes protégées pour les rapports d'activité (admin uniquement)
Route::middleware('auth:sanctum')->prefix('activity-reports')->group(function () {
    Route::post('/', [ActivityReportController::class, 'store']);
    Route::put('/{activityReport}', [ActivityReportController::class, 'update']);
    Route::delete('/{activityReport}', [ActivityReportController::class, 'destroy']);
});

    Route::middleware('can:manage-settings')->prefix('pages/{page}/settings')->group(function () {
        Route::get('/', [SettingsController::class, 'index']);
    });
});
