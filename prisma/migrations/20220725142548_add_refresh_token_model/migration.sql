-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RefreshTokenToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_hashedToken_key" ON "RefreshToken"("hashedToken");

-- CreateIndex
CREATE UNIQUE INDEX "_RefreshTokenToUser_AB_unique" ON "_RefreshTokenToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RefreshTokenToUser_B_index" ON "_RefreshTokenToUser"("B");

-- AddForeignKey
ALTER TABLE "_RefreshTokenToUser" ADD CONSTRAINT "_RefreshTokenToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "RefreshToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RefreshTokenToUser" ADD CONSTRAINT "_RefreshTokenToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
