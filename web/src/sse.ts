export type StreamEvent = { event: string; data: any };
export class SseParser {
  private buffer = "";
  push(chunk: string): StreamEvent[] {
    this.buffer = (this.buffer + chunk).replace(/\r\n/g, "\n");
    const result: StreamEvent[] = [];
    let boundary;
    while ((boundary = this.buffer.indexOf("\n\n")) !== -1) {
      const block = this.buffer.slice(0, boundary);
      this.buffer = this.buffer.slice(boundary + 2);
      let event = "message";
      const data: string[] = [];
      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
      }
      if (data.length)
        result.push({ event, data: JSON.parse(data.join("\n")) });
    }
    return result;
  }
}
