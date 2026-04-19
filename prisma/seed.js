"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const env_1 = require("../src/config/env");
const prisma_1 = require("../src/lib/prisma");
async function main() {
    const passwordHash = await bcryptjs_1.default.hash(env_1.env.seedSuperadminPassword, 10);
    const superadmin = await prisma_1.prisma.user.upsert({
        where: { email: env_1.env.seedSuperadminEmail },
        update: {
            passwordHash,
            role: client_1.UserRole.SUPERADMIN,
        },
        create: {
            email: env_1.env.seedSuperadminEmail,
            passwordHash,
            role: client_1.UserRole.SUPERADMIN,
            name: "Super Admin",
        },
    });
    console.log(`Superadmin ready: ${superadmin.email}`);
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
