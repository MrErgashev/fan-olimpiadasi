#!/bin/bash
# ============================================
# Fan Olimpiadasi — Barcha load testlarni ishga tushirish
# ============================================
# Ishlatish: chmod +x run-all.sh && ./run-all.sh
#
# k6 o'rnatilgan bo'lishi kerak:
#   Mac:     brew install k6
#   Linux:   sudo apt install k6
#   Windows: choco install k6

set -e

echo "============================================"
echo " Fan Olimpiadasi — Load Testing"
echo "============================================"
echo ""

# Sozlamalar
BASE_URL="${BASE_URL:-http://localhost:3000}"
echo "Target: $BASE_URL"
echo ""

# 1. Ro'yxatdan o'tish
echo "--- Senariy 1: Ro'yxatdan o'tish ---"
k6 run --env BASE_URL="$BASE_URL" scenarios/01-registration.js
echo ""

# 2. Test boshlash
echo "--- Senariy 2: Test boshlash ---"
k6 run --env BASE_URL="$BASE_URL" scenarios/02-test-start.js
echo ""

# 3. Test yechish
echo "--- Senariy 3: Test yechish ---"
k6 run --env BASE_URL="$BASE_URL" scenarios/03-active-test.js
echo ""

# 4. Natijalar
echo "--- Senariy 4: Natijalar sahifasi ---"
k6 run --env BASE_URL="$BASE_URL" scenarios/04-results.js
echo ""

# 5. Stress test
echo "--- Senariy 5: Stress test ---"
k6 run --env BASE_URL="$BASE_URL" scenarios/05-stress.js
echo ""

echo "============================================"
echo " Barcha testlar tugadi!"
echo "============================================"
