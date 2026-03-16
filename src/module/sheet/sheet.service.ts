import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import { TeamsService } from '../teams/teams.service';
import { TeamsResolver } from '../teams/teams.resolver';


@Injectable()
export class SheetService {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly teamsResolver: TeamsResolver,
  ) {}
  

  async syncFromGoogleSheet(url: string, subFormatId: number) {
    console.log('Starting sync from Google Sheet...');
    console.log('url to fetch:', url);

    const normalize = (value: string) => {
      if (!value) return value;

      return value
        .split('?')[0]
        .trim()
        .toLowerCase()
        .replace(/\/$/, '');
    };

    const response = await axios.get(url);

    const raw = parse(response.data, {
      skip_empty_lines: true,
    });

    const headerIndex = raw.findIndex((row) =>
      row.includes('Team Description'),
    );

    if (headerIndex === -1) {
      throw new Error('No se encontró la fila de headers');
    }

    const headers = raw[headerIndex];

    const data = raw.slice(headerIndex + 1).map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });

    const filtered = data
      .filter((row) => row['EVs']?.trim().toLowerCase() === 'yes')
      .map((row) => ({
        teamDescription: row['Team Description'],
        pokepaste: normalize(row['Pokepaste']),
        tournamentEvent: row['Tournament / Event'],
        linkToSource: row['Link to Source'],
      }))
      .filter(
        (team) =>
          team.teamDescription &&
          team.pokepaste &&
          !team.pokepaste.includes('extract'),
      );

    const dbUrlsRaw = await this.teamsService.findAllUrlPastes();
    const dbUrls = new Set(dbUrlsRaw.map(normalize));

    const notInDb = filtered.filter(
      (team) => !dbUrls.has(team.pokepaste),
    );

    await Promise.all(
      notInDb.map((team) =>
        this.teamsService.create({
          teamName: team.teamDescription,
          urlPaste: team.pokepaste,
          formatId: 1,
          userId: 2,
          subFormatId: subFormatId, // 👈 ahora dinámico
          isPublic: true,
          descUso: team.linkToSource ?? '',
          tournamentUsing: team.tournamentEvent ?? '',
        }),
      ),
    );

    await this.teamsResolver.actualizarPokes();

    console.log('Sync completed. Total teams in CSV:', filtered.length);

    return {
      totalTeamsCsv: filtered.length,
      totalNewTeams: notInDb.length,
      newTeams: notInDb,
    };
  }
  
  
  /*
  async syncFromGoogleSheet() {
    console.log('Starting sync from Google Sheet...');
    const url =
      //'https://docs.google.com/spreadsheets/d/1axlwmzPA49rYkqXh7zHvAtSP-TKbM0ijGYBPRflLSWw/export?format=csv&gid=1948547929'; //E OK
      'https://docs.google.com/spreadsheets/d/1axlwmzPA49rYkqXh7zHvAtSP-TKbM0ijGYBPRflLSWw/export?format=csv&gid=1837599752'; //F //actual
      //'https://docs.google.com/spreadsheets/d/1axlwmzPA49rYkqXh7zHvAtSP-TKbM0ijGYBPRflLSWw/export?format=csv&gid=418553327'; //G //ok
      //'https://docs.google.com/spreadsheets/d/1axlwmzPA49rYkqXh7zHvAtSP-TKbM0ijGYBPRflLSWw/export?format=csv&gid=1168048410'; //H // ok
      //'https://docs.google.com/spreadsheets/d/1axlwmzPA49rYkqXh7zHvAtSP-TKbM0ijGYBPRflLSWw/export?format=csv&gid=972834435'; //I // OK
      //'https://docs.google.com/spreadsheets/d/1axlwmzPA49rYkqXh7zHvAtSP-TKbM0ijGYBPRflLSWw/export?format=csv&gid=1073751284'; //J //OK
    

      console.log('url to fetch:', url);
    const normalize = (value: string) => {
      if (!value) return value;

      return value
        .split('?')[0]
        .trim()
        .toLowerCase()
        .replace(/\/$/, '');
    };

    const response = await axios.get(url);

    const raw = parse(response.data, {
      skip_empty_lines: true,
    });

    const headerIndex = raw.findIndex((row) =>
      row.includes('Team Description'),
    );

    if (headerIndex === -1) {
      throw new Error('No se encontró la fila de headers');
    }

    const headers = raw[headerIndex];

    const data = raw.slice(headerIndex + 1).map((row) => {
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });

    const filtered = data
      .filter((row) => row['EVs']?.trim().toLowerCase() === 'yes')
      .map((row) => ({
        teamDescription: row['Team Description'],
        pokepaste: normalize(row['Pokepaste']),
        tournamentEvent: row['Tournament / Event'],
        linkToSource: row['Link to Source'],
      }))
      .filter(
        (team) =>
          team.teamDescription &&
          team.pokepaste &&
          !team.pokepaste.includes('extract'),
      );

    const dbUrlsRaw = await this.teamsService.findAllUrlPastes();
    const dbUrls = new Set(dbUrlsRaw.map(normalize));

    const notInDb = filtered.filter(
      (team) => !dbUrls.has(team.pokepaste),
    );

    await Promise.all(
      notInDb.map((team) =>
        this.teamsService.create({
          teamName: team.teamDescription,
          urlPaste: team.pokepaste,
          formatId: 1, //1 = VGC, 2 = OU, 3 = UBER, 4 = UU, 5 = LC, 6 = RU, 7 = Monotype
          userId: 2,
          subFormatId: 2, // 1 = E, 2 = F, 3 = G, 4 = H, 5 = I, 6 = J
          isPublic: true,
          descUso: team.linkToSource ?? '',
          tournamentUsing: team.tournamentEvent ?? '',
        }),
      ),
    );

    await this.teamsResolver.actualizarPokes();

    console.log('Sync completed. Total teams in CSV:', filtered.length);
    //revisar
    //https://pokepast.es/899bbb56fb81fc26
    //https://pokepast.es/75d7d88d480d2757

    return {
      totalTeamsCsv: filtered.length,
      totalNewTeams: notInDb.length,
      newTeams: notInDb,
    };
  }
  */
}