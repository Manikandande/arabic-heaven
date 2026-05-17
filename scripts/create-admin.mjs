// One-time script to create the admin user in the admin_users table
// Usage: node scripts/create-admin.mjs
// Run `npx prisma db push` first if the admin_users table is new

import { readFileSync } from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// Parse .env.local manually and inject into process.env
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
process.env.DATABASE_URL = env['DATABASE_URL']
process.env.DIRECT_URL   = env['DIRECT_URL']

const { hash }       = require('bcryptjs')
const { PrismaPg }   = require('@prisma/adapter-pg')
const { PrismaClient } = require('../src/generated/prisma/index.js')

const adapter = new PrismaPg({ connectionString: env['DATABASE_URL'] })
const prisma  = new PrismaClient({ adapter })

const ADMIN_EMAIL    = 'admin@arabicheaven.com'
const ADMIN_PASSWORD = '@dmin'
const ADMIN_NAME     = 'Admin'

async function main() {
  const existing = await prisma.adminUser.findUnique({ where: { email: ADMIN_EMAIL } })
  if (existing) {
    console.log('ℹ️  Admin user already exists:', existing.id)
    await prisma.$disconnect()
    return
  }

  const passwordHash = await hash(ADMIN_PASSWORD, 12)
  const admin = await prisma.adminUser.create({
    data: { email: ADMIN_EMAIL, passwordHash, name: ADMIN_NAME },
  })

  console.log('✅  Admin user created:', admin.id)
  console.log('')
  console.log('Login credentials:')
  console.log('  URL:      /admin/login')
  console.log('  Email:    admin@arabicheaven.com')
  console.log('  Password: @dmin')

  await prisma.$disconnect()
}

main().catch(err => {
  console.error('❌ ', err.message)
  process.exit(1)
})
