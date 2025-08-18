import fs from "fs";
import path from "path";

const FILE_PATH = path.join(__dirname, "installations.json");

interface Installation {
  companyId: string;
  locationId?: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  waapifyConfig?: {
    accessToken: string;
    instanceId: string;
    whatsappNumber: string;
  };
}

export class Storage {
  static getAll(): Installation[] {
    if (!fs.existsSync(FILE_PATH)) return [];
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(data || "[]");
  }

  static save(inst: Installation) {
    const all = Storage.getAll();
    const idx = all.findIndex(
      (i) =>
        i.companyId === inst.companyId &&
        (inst.locationId ? i.locationId === inst.locationId : true)
    );
    if (idx > -1) {
      all[idx] = inst;
    } else {
      all.push(inst);
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(all, null, 2));
  }

  static find(resourceId: string): Installation | undefined {
    const all = Storage.getAll();
    return all.find((i) => i.companyId === resourceId || i.locationId === resourceId);
  }

  /** Get access token for a specific location */
  static getTokenForLocation(locationId: string): string | null {
    const inst = this.getAll().find((i) => i.locationId === locationId);
    return inst?.access_token || null;
  }

  /** Save Waapify configuration */
  static saveWaapifyConfig(companyId: string, locationId: string, waapifyConfig: { accessToken: string; instanceId: string; whatsappNumber: string }) {
    const all = Storage.getAll();
    const idx = all.findIndex(
      (i) => i.companyId === companyId && (locationId ? i.locationId === locationId : true)
    );
    
    if (idx > -1) {
      all[idx].waapifyConfig = waapifyConfig;
      fs.writeFileSync(FILE_PATH, JSON.stringify(all, null, 2));
    }
  }

  /** Get Waapify configuration */
  static getWaapifyConfig(companyId: string, locationId?: string): { accessToken: string; instanceId: string; whatsappNumber: string } | null {
    const inst = this.getAll().find((i) => 
      i.companyId === companyId && (locationId ? i.locationId === locationId : true)
    );
    return inst?.waapifyConfig || null;
  }
}
