// src/utils/dateUtils.ts

/**
 * Konverterer en Date til "YYYY-MM-DD" streng som passer i <input type="date">
 * Vi bruker lokal tid for å unngå at datoen hopper tilbake en dag pga. tidssoner (UTC).
 */
export const dateToYMD = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Setter tiden til 00:00:00.000 for starten av en dag
   * Tar imot string eller undefined for å være TS-vennlig
   */
  export const startOfDay = (ymd: string | undefined | null): Date => {
    if (!ymd) return new Date();
    const [y, m, d] = ymd.split("-").map(Number);
    // Fallback til dagens årstall hvis splitting feiler
    const year = y ?? new Date().getFullYear();
    const month = m ? m - 1 : new Date().getMonth();
    const day = d ?? new Date().getDate();
    
    return new Date(year, month, day, 0, 0, 0, 0);
  };
  
  /**
   * Setter tiden til 23:59:59.999 for slutten av en dag
   * Tar imot string eller undefined for å være TS-vennlig
   */
  export const endOfDay = (ymd: string | undefined | null): Date => {
    if (!ymd) return new Date();
    const [y, m, d] = ymd.split("-").map(Number);
    const year = y ?? new Date().getFullYear();
    const month = m ? m - 1 : new Date().getMonth();
    const day = d ?? new Date().getDate();
    
    return new Date(year, month, day, 23, 59, 59, 999);
  };