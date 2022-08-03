export default function isCountAll(count: string | number): count is string {
  if (count === 'all') {
    return true;
  }

  return false;
}
