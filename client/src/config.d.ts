declare module '../config' {
  interface Config {
    apiUrl: string;
    isGitHubPages: boolean;
    useStaticData: boolean;
  }
  
  const config: Config;
  export default config;
}