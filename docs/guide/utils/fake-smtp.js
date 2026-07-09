#!/usr/bin/env node
// Minimal in-memory SMTP server used only to make the demo recordings show a
// real "email sent" success instead of a DNS failure. Accepts any AUTH
// credentials and any message; nothing is persisted or forwarded anywhere.
import net from "node:net";

const PORT = Number(process.argv[2] || 2525);

const server = net.createServer((socket) => {
  let mode = "command";
  let buffer = "";

  socket.write("220 localhost ESMTP niftycli-fake\r\n");

  socket.on("data", (chunk) => {
    buffer += chunk.toString("utf8");
    let index;
    while ((index = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, index).replace(/\r$/, "");
      buffer = buffer.slice(index + 1);
      handleLine(line);
    }
  });

  function handleLine(line) {
    if (mode === "data") {
      if (line === ".") {
        mode = "command";
        socket.write("250 OK: queued\r\n");
      }
      return;
    }

    if (mode === "auth-user") {
      mode = "auth-pass";
      socket.write("334 UGFzc3dvcmQ6\r\n");
      return;
    }

    if (mode === "auth-pass") {
      mode = "command";
      socket.write("235 Authentication successful\r\n");
      return;
    }

    const command = line.split(" ")[0].toUpperCase();
    switch (command) {
      case "EHLO":
      case "HELO":
        socket.write("250-localhost\r\n250-AUTH LOGIN PLAIN\r\n250 OK\r\n");
        break;
      case "AUTH":
        mode = "auth-user";
        socket.write("334 VXNlcm5hbWU6\r\n");
        break;
      case "MAIL":
      case "RCPT":
        socket.write("250 OK\r\n");
        break;
      case "DATA":
        mode = "data";
        socket.write("354 Start mail input; end with <CRLF>.<CRLF>\r\n");
        break;
      case "QUIT":
        socket.write("221 Bye\r\n");
        socket.end();
        break;
      case "NOOP":
        socket.write("250 OK\r\n");
        break;
      case "RSET":
        socket.write("250 OK\r\n");
        break;
      default:
        socket.write("250 OK\r\n");
    }
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`fake-smtp listening on 127.0.0.1:${PORT}`);
});
