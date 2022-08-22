export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function updateString(s) {
    return s.replace('\n', ' ').split(" ").filter(x => x).join(' ')
}
