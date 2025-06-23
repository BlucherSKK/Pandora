import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const fonts = [
  {
    name: 'animeacev',
    data: await Bun.file('./assets/animeacev.ttf').arrayBuffer()
  }
];

const WelcomeComponent = ({ name, avatarUrl }: { name: string, avatarUrl: string; }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
    gap: 10,
    padding: 20,
    boxSizing: 'border-box',
    backgroundColor: 'rgba(0,0,0,0.25)'
  }}>
    <div style={{
      display: 'block',
      width: 128,
      height: 128,
      borderRadius: '100%',
      border: '5px solid #555',
      background: `url(${avatarUrl}) center cover`
    }} />

    <span style={{
      fontFamily: 'animeacev',
      color: '#fff',
      fontSize: 30,
      textShadow: '0 0 10px #000',
      textAlign: 'center'
    }}>
      {name}
    </span>
  </div>
);


export default async function makeWelcome(
  name: string,
  avatarUrl: string,
  width: number,
  height: number,
  outfile: string
) {

  const svg = await satori(
    <WelcomeComponent name={name} avatarUrl={avatarUrl} />,
    {
      width,
      height,
      fonts
    }
  );

  await Bun.write(outfile, new Resvg(svg).render().asPng());
}