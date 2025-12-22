import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";


export async function registerUser ({ username, email, password }) {
    const emailExist = await prisma.user.findFirst ({
        where: {
            email
        }
    })

    const usernameExist = await prisma.user.findFirst ({
        where: {
            username
        }
    })

    if (emailExist) {
        throw new Error("Email already used")
    }

    if (usernameExist) {
        throw new Error("choose a different username, username already picked.")
    }

    const  passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            passwordHash
        }
    })

    return user
}

export async function loginUser({email, password}) {
    const user = await prisma.user.findUnique({
        where: {
            OR: [{email}, {usernameExist}]
        }
    })

    if (!user) {
        throw new Error("Invalid credentials")
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
        throw new Error("Password mismatch")
    }

    const token = jwt.sign(
        {
            userId: user.id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    }
}