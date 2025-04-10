# Dokument wymagań produktu (PRD) - 10x-cards

## 1. Przegląd produktu
Produkt 10x-cards to webowa aplikacja umożliwiająca generowanie fiszek edukacyjnych przy użyciu AI na podstawie wprowadzonego tekstu. System pozwala także na ręczne tworzenie, edytowanie, przeglądanie i usuwanie fiszek. Aplikacja zawiera prosty system kont użytkowników do bezpiecznego przechowywania danych oraz integruje fiszki z gotowym, sprawdzonym algorytmem powtórek (spaced repetition).

## 2. Problem użytkownika
Głównym problemem, jaki chcemy rozwiązać, jest czasochłonność ręcznego tworzenia wysokiej jakości fiszek edukacyjnych. Użytkownicy często mają problem z efektywnym podziałem informacji na mniejsze jednostki, co ogranicza korzyści płynące z metody spaced repetition. Aplikacja ma na celu uproszczenie tego procesu poprzez automatyczne generowanie fiszek oraz ułatwienie ich modyfikacji i zatwierdzania.

## 3. Wymagania funkcjonalne
1. Generowanie fiszek przez AI:
   - Użytkownik wkleja tekst (1000-10000 znaków), a AI generuje zestaw fiszek.
   - Fiszki składają się z dwóch stron: przód (maks. 200 znaków) oraz tył (maks. 500 znaków).
   - Prezentacja fiszek jeden po drugim z licznikiem pozostałych do oceny.

2. Ręczne tworzenie i edycja fiszek:
   - Możliwość ręcznego tworzenia fiszek.
   - Użytkownik ma możliwość edycji obu stron fiszki przed zatwierdzeniem, z uwzględnieniem limitów znaków.
   - Wyświetlanie fiszek w ramach widoku listy "Moje fiszki".

3. Zarządzanie oceną fiszek:
   - Opcje akceptacji, odrzucenia oraz edycji fiszek.
   - Możliwość zapisania postępu procesu oceny i powrotu do niego w późniejszym czasie.
   - Funkcja regeneracji lub ręcznej korekty aktualnie ocenianej fiszki.

4. Funkcje administracyjne i bezpieczeństwo:
   - Rejestracja, logowanie, zmiana hasła i usuwanie konta.
   - Przechowywanie danych użytkowników w bazie, z możliwością ich usunięcia wyłącznie przez użytkownika.

5. Integracja z algorytmem powtórek:
   - Fiszki są zintegrowane z gotowym systemem spaced repetition, umożliwiając efektywne zarządzanie nauką.

6. Statystyki generowania fiszek:
   - System rejestruje liczbę fiszek wygenerowanych przez AI oraz liczbę fiszek, które zostały ostatecznie zaakceptowane przez użytkownika.

7. Wymagania prawne i ograniczenia:
   - Dane osobowe użytkowników i fiszek przechowywane zgodnie z RODO.
   - Prawo do wglądu i usunięcia danych (konto wraz z fiszkami) na wniosek użytkownika.

## 4. Granice produktu
1. Nie wchodzi w zakres MVP:
   - Opracowywanie własnego, zaawansowanego algorytmu powtórek (np. SuperMemo, Anki).
   - Import wielu formatów plików (PDF, DOCX, itp.).
   - Współdzielenie zestawów fiszek między użytkownikami.
   - Zaawansowane integracje z innymi platformami edukacyjnymi.
   - Aplikacje mobilne – na początku tylko wersja webowa.

2. Inne ograniczenia:
   - Brak kategorii, tagowania oraz filtrowania fiszek w MVP.
   - Szczegóły dotyczące wizualnego designu interfejsu pozostają do ustalenia w kolejnych iteracjach.
   - Mechanizm regeneracji fiszek pozostaje uproszczony i może nie zachowywać pełnego kontekstu poprzedniej oceny.

## 5. Historyjki użytkowników

ID: US-001
Tytuł: Automatyczne generowanie fiszek
Opis: Jako użytkownik chcę wkleić tekst o długości 1000-10000 znaków, aby system mógł automatycznie wygenerować zestaw fiszek z przodem (do 200 znaków) i tyłem (do 500 znaków).
Kryteria akceptacji:
  - System przyjmuje tekst w określonym zakresie znaków.
  - AI generuje fiszki spełniające limity znaków.
  - Fiszki są prezentowane sekwencyjnie z licznikiem pozostałych do oceny.

ID: US-002
Tytuł: Ręczna edycja wygenerowanych fiszek
Opis: Jako użytkownik chcę móc edytować zarówno przód, jak i tył fiszki, aby dostosować treść do moich potrzeb przed zatwierdzeniem.
Kryteria akceptacji:
  - Użytkownik ma możliwość modyfikacji obu stron fiszki.
  - System egzekwuje ograniczenia długości: 200 znaków dla przodu, 500 znaków dla tyłu.

ID: US-003
Tytuł: Ocena jakości fiszek
Opis: Jako użytkownik chcę móc akceptować lub odrzucać wygenerowane fiszki, aby zachować tylko te, które są dla mnie wartościowe.
Kryteria akceptacji:
  - Opcje akceptacji oraz odrzucenia są łatwo dostępne w interfejsie.
  - Po akceptacji fiszka jest zapisywana, natomiast odrzucone mogą być regenerowane.

ID: US-004
Tytuł: Wstrzymanie i wznowienie procesu oceny
Opis: Jako użytkownik chcę mieć możliwość zapisania postępu oceny fiszek, aby móc kontynuować pracę w późniejszym czasie.
Kryteria akceptacji:
  - System umożliwia zapisanie bieżącego stanu oceny fiszek.
  - Po wznowieniu użytkownik otrzymuje dostęp do niesfinalizowanych fiszek.

ID: US-005
Tytuł: Regeneracja nieodpowiedniej fiszki
Opis: Jako użytkownik chcę móc zregenerować fiszkę, jeśli wygenerowana treść nie spełnia moich oczekiwań, aby otrzymać alternatywną wersję.
Kryteria akceptacji:
  - System udostępnia opcję regeneracji aktualnie ocenianej fiszki.
  - Nowa wersja fiszki jest generowana z zachowaniem oryginalnego kontekstu wejściowego.

ID: US-006
Tytuł: Tworzenie fiszek bez użycia AI
Opis: Jako użytkownik chcę mieć możliwość ręcznego tworzenia fiszek, aby móc wprowadzać własne treści niezależnie od generacji AI.
Kryteria akceptacji:
  - Interfejs umożliwia ręczne dodawanie fiszek z własnymi danymi na przodzie i tyle.
  - System sprawdza i egzekwuje ograniczenia długości znaków.

ID: US-007
Tytuł: Bezpieczny dostęp do konta
Opis: Jako użytkownik chcę logować się do systemu, aby moje dane były chronione oraz dostęp do fiszek był ograniczony tylko do mnie.
Kryteria akceptacji:
  - System posiada funkcje logowania, zmiany hasła oraz usuwania konta.
  - Mechanizmy uwierzytelniania są zgodne z zasadami bezpieczeństwa.

ID: US-008
Tytuł: Administracja konta użytkownika
Opis: Jako użytkownik chcę móc zarządzać moim kontem (zmiana hasła, usunięcie konta), aby mieć kontrolę nad swoimi danymi.
Kryteria akceptacji:
  - Użytkownik może zmienić hasło oraz usunąć konto wraz z przypisanymi danymi.
  - Proces usuwania konta jest potwierdzany i bezpieczny.

ID: US-009
Tytuł: Wyświetlanie statystyk generowania fiszek
Opis: Jako administrator chcę mieć możliwość przeglądania statystyk dotyczących liczby fiszek wygenerowanych przez AI oraz liczby fiszek zaakceptowanych przez użytkowników, aby ocenić efektywność funkcji AI.
Kryteria akceptacji:
  - System wyświetla aktualną liczbę fiszek wygenerowanych przez AI.
  - System wyświetla liczbę fiszek zaakceptowanych przez użytkowników.
  - Statystyki są aktualizowane w czasie rzeczywistym lub przy każdym odświeżeniu panelu.

ID: US-010
Tytuł: Zarządzanie danymi osobowymi zgodnie z RODO
Opis: Jako użytkownik chcę mieć możliwość wglądu w moje dane osobowe oraz żądania ich usunięcia (wraz z fiszkami) w celu zachowania zgodności z przepisami RODO.
Kryteria akceptacji:
  - System umożliwia użytkownikowi wgląd w zgromadzone dane osobowe i dane fiszek.
  - Użytkownik może wysłać żądanie usunięcia danych.
  - Proces usunięcia danych jest zabezpieczony i wymaga potwierdzenia.

## 6. Metryki sukcesu
1. Wskaźnik akceptacji fiszek: co najmniej 75% fiszek wygenerowanych przez AI powinno być akceptowanych przez użytkowników, co będzie monitorowane przez system logowania zdarzeń.
2. Wykorzystanie funkcjonalności AI: co najmniej 75% fiszek tworzonych przez użytkowników powinno pochodzić z funkcji automatycznej generacji AI.
