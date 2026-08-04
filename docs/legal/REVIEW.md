# What a lawyer needs to look at

The terms at `/terms` are a good-faith draft written by the people who built the
site. These are the parts where good faith isn't enough — each one is a question
someone with a law degree should answer before launch gets loud enough to
attract a complaint.

## 1. Indexing without consent
655 projects are listed whose authors never agreed to anything. The position we
take is that public GitHub metadata plus a link is fair, no code is hosted, and
removal is one request away. That's defensible and it's how package registries
and awesome-lists have always worked — but it has never been tested by us, and
the cached README is the weakest part, because a README is a copyrighted work
rather than a fact about a repo.
**Ask:** is caching and displaying full README text safe, or should it be
excerpted, or fetched live and not stored?

## 2. The no-sell rule
This is the ethos of the site, and it is also a restriction we impose on top of
whatever licence the author chose. MIT and GPL both permit selling. We're saying
"not while listed here."
**Ask:** can we enforce that as a condition of listing without misrepresenting
the author's licence to visitors? Does the wording need to make clearer that
this is a Project OS house rule, not a licence term?

## 3. Permanent lineage after removal
Section 3 says fork relationships survive delisting. That's an attribution
argument, and it's the right call for the product, but it means retaining a
reference to something someone asked us to remove.
**Ask:** does that survive a GDPR erasure request from an EU author, given a
GitHub username is personal data?

## 4. Missing entirely
- **Governing law and jurisdiction.** Not stated anywhere.
- **A named legal entity.** "We" is currently one person with no company behind it.
- **A DMCA agent.** Section 3 accepts DMCA complaints without naming an agent
  or an address, which is the part that actually confers safe harbour.
- **A privacy policy.** Section 4 describes what we store, which is not the
  same as having one, and some jurisdictions require the document.
- **Minimum age.** No age gate. GitHub's is 13.

## 5. Liability
Section 6 disclaims liability for third-party code. Disclaimers of liability are
read narrowly and some are unenforceable depending on jurisdiction.
**Ask:** does that clause do anything, and what would make it do more?

---

None of this blocks a soft launch. All of it blocks a launch that goes well
enough for someone to send a letter.
