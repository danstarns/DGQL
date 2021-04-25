function trimmer(str: string): string {
  return str.replace(/\n/g, " ").replace(/\s\s+/g, " ").trim();
}

export default trimmer;
