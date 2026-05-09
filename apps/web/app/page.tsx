import { memberFeatureMatrix, membershipLevels } from '@sleb/shared';

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">SLEB modernization starter</p>
          <h1>Membership, directories, dashboards, and assessments on one clean platform.</h1>
          <p className="lede">
            This scaffold starts as a single-machine demo and keeps the deployment path open
            for clustered web, API, and worker containers.
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="sectionHeader">
          <h2>Membership Plans</h2>
          <p>Initial domain model extracted from the logged-in membership flow.</p>
        </div>
        <div className="planGrid">
          {membershipLevels.map((plan) => (
            <article className="plan" key={plan.id}>
              <h3>{plan.name}</h3>
              <p className="price">{plan.displayPrice}</p>
              <p>{plan.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="sectionHeader">
          <h2>Feature Matrix</h2>
          <p>Server-side permissions will mirror this matrix instead of relying on UI gating.</p>
        </div>
        <div className="matrix">
          {memberFeatureMatrix.map((feature) => (
            <div className="matrixRow" key={feature.key}>
              <span>{feature.label}</span>
              <strong>{feature.minimumLevel}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
