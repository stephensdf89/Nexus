export default async function followerThreshold(input = {}, config = {}) {
  const followers = Number(input.followerCount ?? 0);
  const minimum = Number(config.minimum ?? 0);
  return followers >= minimum;
}
