# Praktiline töö: Autentimine ja maksed (Clerk + Stripe + Render)

## 1. Eesmärk
Selle praktilise töö eesmärk on näidata **low-code** lahendust, kus:
- kasutaja saab autentida **Clerk** hosted login page abil;
- kasutaja saab osta **PRO tellimuse** **Stripe Payment Link** abil (Test Mode);
- pärast edukat makset teeb Stripe automaatselt **redirecti** meie teenusesse **Render** platvormil.

Töö on üles ehitatud nii, et **Clerk ja Stripe** ei pea olema sügavalt “koodi sisse ehitatud” (nt Reacti kaudu). Piisab, kui:
- hosted login page töötab (Clerk),
- payment link töötab (Stripe),
- redirect pärast makset töötab (Render).

---

## 2. Kasutatud teenused
- **Clerk** (Hosted Login Page) – kasutajate sisselogimine
- **Stripe** (Payment Links) – maksete tegemine
- **Render** – Node.js/Express demo teenuse hostimine

---

## 3. Projekti lingid (valmis tulemused)
- **Render teenus:** https://auth-work-a26t.onrender.com  
- **Clerk sign-in (Hosted Login Page):** https://active-mallard-98.accounts.dev/sign-in  
- **Clerk sign-up (Hosted):** https://active-mallard-98.accounts.dev/sign-up  
- **Stripe Payment Link (Test):** https://buy.stripe.com/test_3cI3cvcXs0eI56x2YvaR200  

---

## 4. Funktsionaalsus (projektis olemas olevad teed)
Renderi teenus pakub lihtsaid URL-e, mida saab demonstreerimisel kasutada:

- `/`  
  Avaleht, kus on lingid loginile, ostule ja testlehtedele.

- `/login`  
  Suunab (redirect 302) Clerk hosted sign-in lehele.

- `/buy`  
  Suunab (redirect 302) Stripe Payment Link lehele.

- `/paid`  
  Leht, kuhu Stripe suunab pärast edukat makset (After payment redirect).  
  Kuvab infot ja query-parameetreid (kui Stripe lisab neid).

- `/dashboard`  
  Lihtne “kaitstud” leht: kui kasutaja pole sisse logitud, suunatakse `/login`.  
  (Märkus: see on demo eesmärgil ja ei ole täisväärtuslik autoriseerimissüsteem.)

---

## 5. Clerk seadistamine (ülesande osa: autentimine)
### 5.1 Projekti loomine
1. Ava Clerk: https://clerk.com/
2. Loo uus rakendus (Create application)
3. Pane rakendusele nimi (nt tiimi nimi)

### 5.2 Sisselogimise meetodid
Clerk dashboardis:
- **Authentication → Sign-in methods**
  - Luba **Email + Password**
  - Luba **Google OAuth**

### 5.3 Bränding
Clerk dashboardis:
- **Customization / Branding**
  - Pane tiimi nimi
  - Lisa logo (kui olemas)
  - Soovi korral vali värvid

### 5.4 Hosted Login Page kontroll
Kontrolli brauseris (ka incognito):
- Sign-in: https://active-mallard-98.accounts.dev/sign-in  
- Sign-up: https://active-mallard-98.accounts.dev/sign-up  

Veendu, et olemas on:
- emailiga sisselogimine
- Google sisselogimine

---

## 6. Stripe seadistamine (ülesande osa: maksed)
Kõik sammud tehakse **Stripe Test Mode** režiimis.

### 6.1 Stripe konto ja Test Mode
1. Ava Stripe: https://stripe.com/
2. Logi sisse / registreeru
3. Lülita sisse **Test mode** (Dashboardi ülanurgas)

### 6.2 Toote loomine (Product Catalog)
1. Stripe Dashboard → **Product catalog**
2. **Add product**
3. Nimi: **Meie SaaS-i PRO-tellimus**
4. Hinnastus: **Recurring**
5. Periood: **Monthly**
6. Hind: **15 EUR**
7. Salvesta

### 6.3 Payment Link loomine
1. Ava loodud toode
2. Vajuta **Create payment link**
3. Stripe annab Payment Link URL-i (test link)

Meie loodud link:
- https://buy.stripe.com/test_3cI3cvcXs0eI56x2YvaR200

### 6.4 Redirect pärast makset (oluline “inseneri” osa)
Stripe Payment Link seadetes:
- **After payment → Redirect customers to a URL after payment**
- Redirect URL:
  - `https://auth-work-a26t.onrender.com/paid`

Kontrolli, et:
- URL algab `https://`
- Render teenus on aktiivne
- redirect töötab ka Test Mode’is

---

## 7. Render seadistamine (ülesande osa: redirecti siht)
### 7.1 Render Web Service
1. Ava Render: https://render.com/
2. **New + → Web Service**
3. Vali oma GitHub repo
4. Seaded:
   - Build Command: `npm install`
   - Start Command: `npm start` (või `node server.js`)
   - Root Directory: tühi (kui projekt on repo juurikas)

### 7.2 Environment variables Renderis
Render → Service → **Environment**:
- `STRIPE_PAYMENT_LINK_URL` = `https://buy.stripe.com/test_3cI3cvcXs0eI56x2YvaR200`

Salvesta ja tee deploy (kui vaja).

### 7.3 Renderi kontroll
Kontrolli:
- `https://auth-work-a26t.onrender.com/` → peab näitama “OK …”
- `https://auth-work-a26t.onrender.com/paid` → peab näitama “Payment redirect works ✅” (või JSON)

---

## 8. Testimine (Stripe testkaart)
Eduka testmakse jaoks kasuta:
- Card number: `4242 4242 4242 4242`
- Expiry: suvaline tuleviku kuupäev (nt `12/26`)
- CVC: suvaline (nt `123`)
- ZIP: suvaline (nt `12345`)

Testimise sammud:
1. Ava Payment Link
2. Sisesta testkaardi andmed
3. Kinnita makse
4. Pärast edu peab Stripe suunama:
   - `https://auth-work-a26t.onrender.com/paid`

---

## 9. Projekti käivitamine lokaalselt (soovi korral)
### 9.1 Nõuded
- Node.js (>= 18)

### 9.2 Paigaldus
```bash
npm install