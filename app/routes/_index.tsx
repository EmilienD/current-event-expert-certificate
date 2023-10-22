import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { useLocation } from "@remix-run/react";
import { toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/main.css";
import { useDebouncedCallback } from "use-debounce";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default function Index() {
  const [domainOfExpertise, setDomainOfExpertise] = useState("");
  const [expert, setExpert] = useState("");
  const date = useMemo(
    () => new Date().toLocaleDateString("fr-FR", { dateStyle: "full" }),
    []
  );

  const diplomaRef = useRef<HTMLDivElement>(null);
  const diplomaImageRef = useRef<HTMLImageElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const linkRef = useRef<HTMLAnchorElement>(null);
  const debouncedGenerateImage = useDebouncedCallback(async () => {
    if (diplomaImageRef.current && diplomaRef.current) {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      const base64Url = await toPng(diplomaRef.current);
      const blob = await fetch(base64Url).then((res) => res.blob());
      const browserUrl = URL.createObjectURL(blob);
      setImageUrl(browserUrl);
    }
  }, 500);
  useEffect(() => {
    debouncedGenerateImage();
  }, [expert, domainOfExpertise, debouncedGenerateImage]);
  const [hostname, setHostname] = useState("");
  const [hasClipboard, setHasClipboard] = useState(false);
  useEffect(() => {
    setHostname(location.hostname);
    setHasClipboard(!!window.ClipboardItem);
  }, []);
  return (
    <main>
      <p>
        Que serions-nous sans nos experts en "insérer sujet d'actualité" sur
        Facebook ? Rien en fait !
      </p>
      <form method="get" action={imageUrl}>
        <label htmlFor="domainOfExpertiseInput">Domaine d'expertise:</label>
        <input
          id="domainOfExpertiseInput"
          name="domainOfExpertiseInput"
          type="text"
          onChange={(ev) => setDomainOfExpertise(ev.target.value)}
          value={domainOfExpertise}
        />
        <label htmlFor="expertName">Nom de l'expert:</label>
        <input
          id="expertName"
          name="expertName"
          type="text"
          onChange={(ev) => setExpert(ev.target.value)}
          value={expert}
        />
        <button
          type="button"
          onClick={() => {
            linkRef.current?.click();
          }}
        >
          Télécharger le diplôme
        </button>
        {!!hasClipboard && (
          <button
            type="button"
            onClick={async (ev) => {
              if (imageUrl) {
                const blob = await fetch(imageUrl).then((res) => res.blob());
                navigator.clipboard
                  .write([new ClipboardItem({ "image/png": blob })])
                  .catch(() => {});
              }
            }}
          >
            Copier dans le presse-papier
          </button>
        )}
      </form>

      <img
        id="diplomaImage"
        ref={diplomaImageRef}
        src={imageUrl}
        alt="Diplôme du ministère des réseaux sociaux et discussions de comptoire, université de Facebook"
      />
      <a
        href={imageUrl}
        download={`Diplome de ${expert} - Expert ${domainOfExpertise}.png`}
        ref={linkRef}
      >
        Lien
      </a>
      <div className="diploma-container">
        <div id="diploma" className="fancy" ref={diplomaRef}>
          <p className="ministry">
            Ministère des réseaux sociaux et des discussions de comptoire
          </p>
          <p className="university">Université de Facebook</p>

          <p>
            <span className="expertise-start">Le diplôme d'</span>
            <br />
            <span className="expertise">
              Expert <span>{domainOfExpertise}</span>
            </span>
          </p>
          <p className="expert-block">
            <span>est délivré à</span>
            <br />
            <span className="expert-name">{expert}</span>
            <br />
            le {date}
          </p>
          {hostname && <p className="watermark">{hostname}</p>}
        </div>
      </div>
    </main>
  );
}
