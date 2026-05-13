/** مكوّن مشترك لقسم الصورة/النص المتناوب (15:10) في متجر Vite */
export function ProductPdpStoryVite({ title, blocks }) {
  return (
    <div className="pdp-parking-story">
      <h2 className="pdp-parking-story__title">{title}</h2>
      {blocks.map((b, i) => (
        <article
          key={b.key}
          className={`pdp-zigzag-row ${i % 2 === 1 ? "pdp-zigzag-row--reverse" : ""}`}
        >
          <div className="pdp-zigzag-media">
            <img src={b.imageSrc} alt={b.title} loading={i < 2 ? "eager" : "lazy"} decoding="async" />
          </div>
          <div className="pdp-zigzag-text">
            <h3 className="pdp-zigzag-heading">{b.title}</h3>
            <p className="pdp-zigzag-body">{b.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
