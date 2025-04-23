# Diagram architektury UI dla modułu autentykacji

<architecture_analysis>

1. Komponenty wymienione w dokumentacji i znalezione w codebase:

Strony Astro:
- `/login` - strona logowania
- `/register` - strona rejestracji
- `/forgot-password` - strona odzyskiwania hasła
- `/reset-password` - strona resetowania hasła
- `/logout` - strona wylogowania

Komponenty React:
- `LoginForm` - formularz logowania
- `RegisterForm` - formularz rejestracji
- `ForgotPasswordForm` - formularz odzyskiwania hasła
- `ResetPasswordForm` - formularz resetowania hasła
- `LogoutMessage` - komunikat potwierdzający wylogowanie

Layout:
- `AuthLayout.astro` - dedykowany layout dla widoków wymagających autentykacji

API Endpoints:
- `/api/auth/register` - rejestracja użytkownika
- `/api/auth/login` - logowanie
- `/api/auth/logout` - wylogowywanie
- `/api/auth/forgot-password` - wysyłanie linku do odzyskiwania hasła
- `/api/auth/reset-password` - resetowanie hasła
- `/api/auth/update-account` - aktualizacja danych użytkownika
- `/api/auth/delete-account` - usuwanie konta

2. Główne strony i ich komponenty:
- Strona logowania -> LoginForm
- Strona rejestracji -> RegisterForm
- Strona odzyskiwania hasła -> ForgotPasswordForm
- Strona resetowania hasła -> ResetPasswordForm
- Strona wylogowania -> LogoutMessage

3. Przepływ danych:
- Komponenty React -> API Endpoints -> Supabase Auth
- Middleware weryfikuje sesję dla chronionych stron
- Strony Astro wykorzystują SSR do renderowania na podstawie stanu autentykacji
- Strona wylogowania komunikuje się z API przez LogoutMessage

4. Funkcjonalność komponentów:
- Formularze React: walidacja, obsługa błędów, komunikacja z API
- Strony Astro: routing i renderowanie server-side
- AuthLayout: zarządzanie layoutem dla zalogowanych użytkowników
- Middleware: weryfikacja sesji i przekierowania
- API Endpoints: obsługa żądań autentykacji i komunikacja z Supabase
- LogoutMessage: obsługa procesu wylogowania i wyświetlanie komunikatu potwierdzającego

</architecture_analysis>

```mermaid
flowchart TD
    %% Główne grupy
    subgraph "Strony Astro"
        Login["Strona Logowania"]
        Register["Strona Rejestracji"]
        ForgotPwd["Strona Odzyskiwania Hasła"]
        ResetPwd["Strona Resetowania Hasła"]
        Logout["Strona Wylogowania"]
    end

    subgraph "Komponenty React"
        LoginForm["Formularz Logowania"]
        RegisterForm["Formularz Rejestracji"]
        ForgotForm["Formularz Odzyskiwania Hasła"]
        ResetForm["Formularz Resetowania Hasła"]
        LogoutMsg["Komunikat Wylogowania"]
    end

    subgraph "API Endpoints"
        LoginAPI["POST /api/auth/login"]
        RegisterAPI["POST /api/auth/register"]
        LogoutAPI["POST /api/auth/logout"]
        ForgotAPI["POST /api/auth/forgot-password"]
        ResetAPI["POST /api/auth/reset-password"]
        UpdateAPI["POST /api/auth/update-account"]
        DeleteAPI["POST /api/auth/delete-account"]
    end

    subgraph "Infrastruktura"
        AuthLayout["AuthLayout"]
        Middleware["Middleware Autentykacji"]
        SupabaseAuth["Supabase Auth"]
    end

    %% Połączenia między komponentami
    Login --> LoginForm
    Register --> RegisterForm
    ForgotPwd --> ForgotForm
    ResetPwd --> ResetForm
    Logout --> LogoutMsg

    LoginForm --> LoginAPI
    RegisterForm --> RegisterAPI
    ForgotForm --> ForgotAPI
    ResetForm --> ResetAPI
    LogoutMsg --> LogoutAPI

    LoginAPI --> SupabaseAuth
    RegisterAPI --> SupabaseAuth
    LogoutAPI --> SupabaseAuth
    ForgotAPI --> SupabaseAuth
    ResetAPI --> SupabaseAuth
    UpdateAPI --> SupabaseAuth
    DeleteAPI --> SupabaseAuth

    Middleware --"Weryfikacja Sesji"--> SupabaseAuth
    AuthLayout --"Sprawdzanie Autoryzacji"--> Middleware

    %% Style
    classDef page fill:#f9f,stroke:#333,stroke-width:2px
    classDef component fill:#bbf,stroke:#333,stroke-width:2px
    classDef api fill:#bfb,stroke:#333,stroke-width:2px
    classDef infra fill:#fbb,stroke:#333,stroke-width:2px

    class Login,Register,ForgotPwd,ResetPwd,Logout page
    class LoginForm,RegisterForm,ForgotForm,ResetForm,LogoutMsg component
    class LoginAPI,RegisterAPI,LogoutAPI,ForgotAPI,ResetAPI,UpdateAPI,DeleteAPI api
    class AuthLayout,Middleware,SupabaseAuth infra
```
