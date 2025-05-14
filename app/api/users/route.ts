import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "better-auth/crypto";

// GET method for listing users with pagination
export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from the URL
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Fetch users with pagination
    const users = await prisma.users.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        division: true,
        district: true,
        upazila: true,
        stationName: true,
        stationId: true,
        // Don't include password or sensitive fields
      },
    });
    
    // Get total count for pagination
    const total = await prisma.users.count();
    
    return NextResponse.json({
      users,
      total,
      limit,
      offset,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PUT method for updating users
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      name, 
      email, 
      password,
      role, 
      division, 
      district, 
      upazila, 
      stationName, 
      stationId, 
      securityCode 
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: {
      name?: string;
      email?: string;
      role?: string;
      division?: string;
      district?: string;
      upazila?: string;
      stationName?: string;
      stationId?: string;
      securityCode?: string;
      password?: string;
      updatedAt: Date;
    } = {
      name,
      email,
      role,
      division,
      district,
      upazila,
      stationName,
      stationId,
      securityCode,
      updatedAt: new Date(),
    };

    // Only update password if provided
    if (password && password.trim() !== '') {
      // Hash the password using better-auth's hashPassword function
      updateData.password = await hashPassword(password);
    }

    // Update user in the database
    const updatedUser = await prisma.users.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    return NextResponse.json(
      { message: "User updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// POST method for creating users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      password,
      role, 
      division, 
      district, 
      upazila, 
      stationName, 
      stationId, 
      securityCode 
    } = body;

    // Validate required fields
    if (!email || !password || !role || !division || !district || !upazila) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user with email already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password using better-auth's hashPassword function
    const hashedPassword = await hashPassword(password);

    // Use a transaction to create the user and then the account
    const result = await prisma.$transaction(async (tx) => {
      // First create the user
      const newUser = await tx.users.create({
        data: {
          name: name || null,
          email,
          role: role || null,
          division,
          district,
          upazila,
          stationName: stationName || null,
          stationId: stationId || null,
          securityCode: securityCode || null,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          image: null,
          banned: false,
          banReason: null,
          banExpires: null,
          twoFactorEnabled: false,
        },
      });

      // Then create the account with the user's ID
      await tx.accounts.create({
        data: {
          accountId: newUser.id, // Use the user's ID as the accountId
          providerId: 'credential',
          userId: newUser.id, // Link to the user
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return newUser;
    });

    // Create a user object without the password for the response
    const userWithoutPassword = {
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role,
      division: result.division,
      district: result.district,
      upazila: result.upazila,
      stationName: result.stationName,
      stationId: result.stationId,
      createdAt: result.createdAt,
    };

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

// DELETE method for removing users
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Delete user from the database
    await prisma.users.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
