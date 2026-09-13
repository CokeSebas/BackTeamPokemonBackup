import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import { TeamsService } from '../teams/teams.service';
import { TeamsResolver } from '../teams/teams.resolver';
import { NotificationService } from '../notification/notification.service';


@Injectable()
export class SheetService {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly teamsResolver: TeamsResolver,
    private notificationService: NotificationService
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
    const cleanHeaders = headers.map(h => h.replace(/\n/g, ' ').trim());

    const data = raw.slice(headerIndex + 1).map((row) => {
      const obj = {};
      cleanHeaders.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });


    const filtered = data
      .filter((row) => row['EVs']?.trim().toLowerCase() === 'yes')
      .map((row) => {
        const base: any = {
          teamDescription: row['Team Description'],
          pokepaste: normalize(row['Pokepaste']),
          tournamentEvent: row['Tournament / Event'],
          linkToSource: row['Link to Source'],
          codeRental: null,
        };

        // 👉 nueva lógica condicional
        if (subFormatId >= 7) {
          const replicaStatus = row['Replica Status']?.trim();
          const replicaCode = row['Replica Code (Click text for image)']?.trim();

          if (replicaStatus === '✔' && replicaCode && replicaCode !== 'None') {
            base.codeRental = replicaCode;
          }
        }

        return base;
      })
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
          subFormatId: subFormatId,
          isPublic: true,
          descUso: team.linkToSource ?? '',
          tournamentUsing: team.tournamentEvent ?? '',
          codeRental: team.codeRental ?? null, // 👈 aquí
        }),
      ),
    );

    if (notInDb.length > 0) {
      const today = new Date();

      const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      await this.notificationService.createNotification({
        textId: `${Date.now()}-sync-teams`,
        title: 'Nuevos equipos disponibles',
        message: `Se agregaron ${notInDb.length} nuevos equipos a la pagina.`,
        link: '/vgc/teams',
        publishDate: date as any,
      });
    }

    await this.teamsResolver.actualizarPokes();

    console.log('Sync completed. Total teams in CSV:', filtered.length);

    return {
      totalTeamsCsv: filtered.length,
      totalNewTeams: notInDb.length,
      newTeams: notInDb,
    };
  }
  
}