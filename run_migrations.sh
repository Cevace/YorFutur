#!/bin/bash

# Script to run database migrations in Supabase
# This script copies the SQL migrations to clipboard for easy pasting

echo "🔄 Database Migraties Uitvoeren"
echo "================================"
echo ""
echo "Stap 1: Open Supabase SQL Editor"
echo "  URL: https://supabase.com/dashboard/project/hnwkppqegkcmuqikafgv/sql/new"
echo ""
echo "Stap 2: Kopieer en run deze migratie:"
echo ""
echo "--- MIGRATIE 1: Beta Tester Column ---"
cat supabase/migrations/add_beta_tester_column.sql
echo ""
echo ""
echo "Stap 3: Kopieer en run deze migratie:"
echo ""
echo "--- MIGRATIE 2: Waitlist Table ---"
cat supabase/migrations/create_waitlist_table.sql
echo ""
echo "================================"
echo "✅ Klaar! Je kunt nu deployen"
