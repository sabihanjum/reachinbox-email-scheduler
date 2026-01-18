import { PrismaClient } from "@prisma/client";
import nodemailer, { Transporter } from "nodemailer";

const transporterCache: Record<string, Transporter> = {};

type EmailStatusType = "scheduled" | "queued" | "sending" | "sent" | "failed";

interface SenderConfig {
  id: string;
  userId?: string | null;
  name: string;
  fromEmail: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}

export const ensureDefaultSender = async (
  prisma: PrismaClient,
  userId: string
): Promise<SenderConfig> => {
  const existing = await prisma.sender.findFirst({ where: { userId } });
  if (existing) return existing as unknown as SenderConfig;

  const testAccount = await nodemailer.createTestAccount();
  const created = await prisma.sender.create({
    data: {
      userId,
      name: "Ethereal Test",
      fromEmail: testAccount.user,
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      username: testAccount.user,
      password: testAccount.pass,
    },
  });
  return created as unknown as SenderConfig;
};

const buildTransporter = (sender: SenderConfig): Transporter => {
  if (transporterCache[sender.id]) return transporterCache[sender.id];

  const transporter = nodemailer.createTransport({
    host: sender.host,
    port: sender.port,
    secure: sender.secure,
    auth: {
      user: sender.username,
      pass: sender.password,
    },
  });

  transporterCache[sender.id] = transporter;
  return transporter;
};

export const sendEmail = async (
  prisma: PrismaClient,
  sender: SenderConfig,
  toEmail: string,
  subject: string,
  body: string
) => {
  const transporter = buildTransporter(sender);

  const info = await transporter.sendMail({
    from: `${sender.name} <${sender.fromEmail}>`,
    to: toEmail,
    subject,
    html: body,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

  return { messageId: info.messageId, previewUrl };
};

export const markJobStatus = async (
  prisma: PrismaClient,
  jobId: string,
  status: EmailStatusType,
  extra?: { error?: string; messageId?: string }
) => {
  await prisma.emailJob.update({
    where: { id: jobId },
    data: {
      status,
      error: extra?.error,
      providerMessageId: extra?.messageId,
      sentAt: status === "sent" ? new Date() : undefined,
    },
  });
};
