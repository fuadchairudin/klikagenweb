import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding Wallets...')
  await prisma.wallet.upsert({
    where: { localId: 1 },
    update: {},
    create: {
      localId: 1,
      name: 'Digital (Bank)',
      type: 'Digital',
      balance: 0,
    },
  })

  await prisma.wallet.upsert({
    where: { localId: 2 },
    update: {},
    create: {
      localId: 2,
      name: 'Tunai (Laci)',
      type: 'Tunai',
      balance: 0,
    },
  })

  console.log('Start seeding Services...')
  const services = [
    { localId: 1, name: 'Transfer Sesama BRI', adminBank: 0 },
    { localId: 2, name: 'Transfer Antar Bank', adminBank: 6500 },
    { localId: 3, name: 'Topup DANA/OVO/GoPay', adminBank: 1000 },
    { localId: 4, name: 'Tarik Tunai', adminBank: 0 },
  ]

  for (const svc of services) {
    await prisma.service.upsert({
      where: { localId: svc.localId },
      update: {},
      create: {
        localId: svc.localId,
        name: svc.name,
        adminBank: svc.adminBank,
      },
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
