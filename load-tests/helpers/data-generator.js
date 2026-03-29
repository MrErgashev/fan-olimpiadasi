/**
 * Random o'quvchi ma'lumotlari generatsiya qilish
 */

const firstNames = [
  "Jasur", "Sardor", "Bobur", "Aziz", "Sherzod", "Dilshod", "Bekzod",
  "Nodir", "Otabek", "Jamshid", "Ulugbek", "Farrux", "Sanjar", "Mirzo",
  "Abdulloh", "Doniyor", "Islom", "Mansur", "Ravshan", "Behruz",
];

const lastNames = [
  "Karimov", "Ergashev", "Toshmatov", "Umarov", "Xolmatov", "Nishonov",
  "Rahimov", "Abdullayev", "Ismoilov", "Mirzayev", "Botirov", "Sobirov",
  "Yusupov", "Normatov", "Qodirov", "Olimov", "Haydarov", "Salimov",
];

const schools = [
  "1-sonli maktab", "5-sonli maktab", "12-sonli maktab", "Oriental Akademik Litsey",
  "Prezident maktabi", "AQSH maktabi", "21-sonli maktab", "Specialized school",
];

export function randomFirstName() {
  return firstNames[Math.floor(Math.random() * firstNames.length)];
}

export function randomLastName() {
  return lastNames[Math.floor(Math.random() * lastNames.length)];
}

export function randomSchool() {
  return schools[Math.floor(Math.random() * schools.length)];
}

export function randomPhone() {
  const num = Math.floor(Math.random() * 900000000) + 100000000;
  return `+998${num}`;
}

export function randomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 10; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

export function generateStudent() {
  return {
    firstName: randomFirstName(),
    lastName: randomLastName(),
    phone: randomPhone(),
    password: randomPassword(),
    schoolName: randomSchool(),
  };
}
