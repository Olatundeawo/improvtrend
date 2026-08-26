import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import prisma from "../prisma/client.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        throw new Error("Choose a different username, username already picked.")
    }
   

    const  passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            passwordHash,
            authProvider: "LOCAL"
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

    if (!user.passwordHash) {
        throw new Error("This account uses Google sign-in. Please continue with Google.")
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

export async function loginWithGoogleService({ idToken }) {
    // Verify the token actually came from Google and wasn't tampered with
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
        throw new Error("Invalid Google token");
    }

    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email_verified) {
        throw new Error("Google email not verified");
    }

    // 1. Check if we already know this Google account
    let user = await prisma.user.findUnique({
        where: { googleId }
    });

    if (!user) {
        // 2. Not found by googleId — check if the email already exists
        //    (e.g. they originally signed up with password, now using Google)
        user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            // Link the existing account to Google instead of creating a duplicate
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId,
                    avatarUrl: user.avatarUrl ?? picture,
                    authProvider: user.passwordHash ? user.authProvider : "GOOGLE",
                }
            });
        } else {
            // 3. Brand new user — generate a unique username from their name/email
            const username = await generateUniqueUsername(name || email.split("@")[0]);

            user = await prisma.user.create({
                data: {
                    username,
                    email,
                    googleId,
                    avatarUrl: picture,
                    authProvider: "GOOGLE",
                    // passwordHash stays null
                }
            });
        }
    }

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
        }
    };
}


export async function updateProfile(userId, { bio, avatarUrl, genrePreferences }) {
    const data = {};

    if (bio !== undefined) {
        if (bio !== null && bio.length > 280) {
            throw new Error("Bio must be 280 characters or less");
        }
        data.bio = bio;
    }

    if (avatarUrl !== undefined) {
        data.avatarUrl = avatarUrl;
    }

    if (genrePreferences !== undefined) {
        const validGenres = [
            "COMEDY", "HORROR", "ROMANCE", "MYSTERY", "FANTASY",
            "SCI_FI", "DRAMA", "ADVENTURE", "THRILLER", "SLICE_OF_LIFE"
        ];
        const invalid = genrePreferences.filter(g => !validGenres.includes(g));
        if (invalid.length > 0) {
            throw new Error(`Invalid genre(s): ${invalid.join(", ")}`);
        }
        data.genrePreferences = genrePreferences;
    }

    if (Object.keys(data).length === 0) {
        throw new Error("No valid fields provided to update");
    }

    const user = await prisma.user.update({
        where: { id: userId },
        data
    });

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        genrePreferences: user.genrePreferences,
    };
}

export async function getProfile(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            avatarUrl: true,
            genrePreferences: true,
            level: true,
            xp: true,
            streak: true,
            storyCount: true,
            createdAt: true,
            badges: true,
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

// Helper: turn "John Doe" into "johndoe", "johndoe2", etc. until unique
async function generateUniqueUsername(base) {
    const cleaned = base
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 20) || "user";

    let candidate = cleaned;
    let suffix = 1;

    while (await prisma.user.findUnique({ where: { username: candidate } })) {
        suffix += 1;
        candidate = `${cleaned}${suffix}`;
    }

    return candidate;
}

