const { ImapFlow } = require("imapflow");

function getISOWeekNumber(date) {
  var target = new Date(date);
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  var firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 is the number of milliseconds in a week
}

const client = new ImapFlow({
  host: process.env.IMAP_HOST,
  port: process.env.IMAP_PORT || 993,
  secure: process.env.IMAP_TLS === "false" || true,
  auth: {
    user: process.env.IMAP_USER,
    pass: process.env.IMAP_PASSWORD,
  },
  logger: false,
});

const users = [{ telegram: "@Steen3S" }, { telegram: "@adriaanvanrossum" }];

const getUser = () => {
  // Odd weeks are for Steen, even weeks are for Adriaan
  const week = getISOWeekNumber(new Date());
  return users[week % users.length];
};

const main = async () => {
  // Wait until client connects and authorizes
  await client.connect();

  // Select and lock a mailbox. Throws if mailbox does not exist
  let lock = await client.getMailboxLock("INBOX");
  try {
    // List subjects for all messages
    // uid value is always included in FETCH response, envelope strings are in unicode.
    for await (let message of client.fetch("1:*", { envelope: true })) {
      const firstname = message.envelope?.from?.[0]?.name?.split(" ")[0];
      const subject = message.envelope.subject?.replace(/^Re: /i, "");
      console.log({
        user: getUser().telegram,
        firstname,
        subject,
      });
    }
  } finally {
    // Make sure lock is released, otherwise next `getMailboxLock()` never returns
    lock.release();
  }

  // // Select and lock a mailbox. Throws if mailbox does not exist
  // let lock = await client.getMailboxLock("INBOX");
  // try {
  //   // fetch latest message source
  //   // client.mailbox includes information about currently selected mailbox
  //   // "exists" value is also the largest sequence number available in the mailbox
  //   let message = await client.fetchOne(client.mailbox.exists, {
  //     source: true,
  //   });
  //   console.log(message.source.toString());

  //   // list subjects for all messages
  //   // uid value is always included in FETCH response, envelope strings are in unicode.
  //   for await (let message of client.fetch("1:*", { envelope: true })) {
  //     console.log(`${message.uid}: ${message.envelope.subject}`);
  //   }
  // } finally {
  //   // Make sure lock is released, otherwise next `getMailboxLock()` never returns
  //   lock.release();
  // }

  // log out and close connection
  await client.logout();
};

main().catch((err) => console.error(err));
