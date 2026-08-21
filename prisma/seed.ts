import prisma from '../lib/prisma'

async function main() {
  // Clear existing
  await prisma.command.deleteMany()

  const items = [
    {
      title: 'Nmap: Aggressive Scan (Toʻliq)',
      category: 'Recon & Scan',
      commandText: 'nmap -sC -sV -p- <target>',
      shortDesc: "-sC: default skriptlar; -sV: servis versiyasini aniqlash; -p-: barcha portlar",
      fullDoc: `Nmap - keng qo'llaniladigan tarmoqli skaner.

Sintaksis misol: 

	nmap -sC -sV -p- <target>

Tushuntirish:
- -sC: aslida default skriptlar to'plamini ishga tushiradi, tez tekshiruvlar uchun foydali.
- -sV: portlardagi servis va ularning versiyasini aniqlaydi.
- -p-: 1-65535 barcha portlarni skanerlash.

Xavfsizlik ogohlantiruvi: Bu buyruqlarni faqat ruxsatli tarmoqlarda ishlating; ruxsatsiz skanerlash qonunga zid bo'lishi mumkin.`,
      parameters: [
        { flag: '-sC', desc: "Default skriptlar (recon yordamchi)" },
        { flag: '-sV', desc: "Servis va versiyalarni aniqlash" },
        { flag: '-p-', desc: "Barcha portlarni tekshirish (1-65535)" }
      ]
    },
    {
      title: 'Sqlmap: Baza maʼlumotlarini aniqlash',
      category: 'Exploitation',
      commandText: 'sqlmap -u <url> --batch --dbs',
      shortDesc: "--batch: avtomatik tasdiqlash; --dbs: ma'lumotlar bazalarini chiqarish",
      fullDoc: `Sqlmap - SQL injektsiyalarni avtomatlashtirish vositasi.

Misol:

	sqlmap -u "http://target/?id=1" --batch --dbs

Tushuntirish:
- --batch: barcha interaktiv so'rovlarni avtomatik javob bilan o'tkazadi.
- --dbs: serverdagi mavjud ma'lumotlar bazalarini ro'yxatini chiqaradi.

Xavfsizlik: Faqat test muhitida yoki ruxsat olingan holatlarda ishlating. Noto'g'ri ishlatish ma'lumot yo'qotilishiga olib kelishi mumkin.`,
      parameters: [
        { flag: '--batch', desc: "Interaktiv so'rovlarni avtomatik tasdiqlash" },
        { flag: '--dbs', desc: "Ma'lumotlar bazalarini ro'yxatini chiqarish" }
      ]
    },
    {
      title: 'Gobuster: Katalogni (dir) qidirish',
      category: 'Recon & Scan',
      commandText: 'gobuster dir -u <url> -w <wordlist>',
      shortDesc: 'dir rejimida kataloglarni va fayllarni topish',
      fullDoc: `Gobuster - web resurslarni so'z ro'yxati yordamida qidirish uchun vosita.

Misol:

	gobuster dir -u http://target/ -w /path/wordlist.txt

Tushuntirish:
- -u: nishon URL
- -w: kalit so'zlar fayli (wordlist)

Xavfsizlik: Brute-force so'rovlar server yukini oshiradi va IDS/IPS sistemalarini trigger qilishi mumkin.`,
      parameters: [
        { flag: '-u', desc: "Nishon URL" },
        { flag: '-w', desc: "So'z ro'yxati fayli (wordlist)" }
      ]
    }
  ]

  for (const it of items) {
    await prisma.command.create({
      data: {
        title: it.title,
        category: it.category,
        commandText: it.commandText,
        shortDesc: it.shortDesc,
        fullDoc: it.fullDoc,
        parameters: it.parameters
      }
    })
  }

  console.log('Seed data added')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })