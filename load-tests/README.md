# Fan Olimpiadasi — Load Testing

k6 (Grafana k6) yordamida yuklamani tekshirish scriptlari.

## k6 o'rnatish

```bash
# Mac
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D68
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# Windows
choco install k6
```

## Sozlash

`config.js` faylida quyidagilarni o'zgartiring:
- `BASE_URL` — platformangiz URL manzili
- `ACCESS_CODE` — mavjud access kod
- `TEST_ID` — aktiv testning ID si
- `STUDENT_PHONE` / `STUDENT_PASSWORD` — test uchun o'quvchi

## Ishga tushirish

```bash
# Bitta senariy
k6 run --env BASE_URL=https://your-domain.com scenarios/01-registration.js

# Barcha senariylar ketma-ket
chmod +x run-all.sh
BASE_URL=https://your-domain.com ./run-all.sh
```

## Senariylar

| # | Senariy | VU | Maqsad |
|---|---------|----|----|
| 01 | Ro'yxatdan o'tish | 500 | p95 < 2s |
| 02 | Test boshlash | 200 | Test < 3s, savol < 500ms |
| 03 | Test yechish | 500 | Javob < 300ms |
| 04 | Natijalar sahifasi | 1000 | p95 < 2s |
| 05 | Stress test | 100→2000 | Sinish nuqtasini topish |

## Natijalarni o'qish

```
http_req_duration..............: avg=245ms  min=12ms  max=3.2s  p(95)=890ms  p(99)=1.8s
http_req_failed................: 0.23%  ✓ 12   ✗ 5188
```

### Natija baholash:
- **p(95) < 2s, xato < 1%** → ✅ Production ga tayyor
- **p(95) 2-5s** → ⚠️ Optimizatsiya kerak (indeks, cache)
- **p(95) > 5s yoki xato > 5%** → ❌ Muammo bor
