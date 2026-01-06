import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";


export async function registerUser ({ username, email, password }) {
    const emailExist = await prisma.user.findFirst ({
        where: {
            email
        }
    })

    if (emailExist) {
        throw new Error("Email already used")
    }

    const usernameExist= await prisma.user.findFirst ({
        where: {
            username
        }
    });


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

export async function loginUser({email, username, password}) {
    const user = await prisma.user.findFirst({
        where: {
            OR: [{email: email || undefined}, {username: username || undefined}]
        },
        include: {
            stories: {
                include: {
                    turns: true
                }
            },
            
        },
    
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
            email: user.email,
            createdAt: user.createdAt,
        }
    }
}
