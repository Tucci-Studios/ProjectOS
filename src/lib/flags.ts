/**
 * Temporary switches. Each one needs a reason and an owner.
 *
 * SHOW_EVERYONE_VERIFIED — every author on the site is currently a shadow user
 * indexed from GitHub, so the verified mark renders exactly nowhere and can't
 * be judged. This forces it on so the design can be looked at. Turn it off
 * before anyone else sees the site: it claims people have signed in who
 * haven't, which is the one thing the mark is supposed to mean.
 */
export const SHOW_EVERYONE_VERIFIED = true;
