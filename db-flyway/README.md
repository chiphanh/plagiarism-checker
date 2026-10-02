# Prerequisite

- a local PostgreSQL database for migration.


# Start a Database Migration

Specify the credentials of your local database in `flyway.sh` (including url, username, passsword and schema).

Run `flyway.sh` to start a database migration.


# Version Description

| From   | To     | Description                                                                                                                                                                                          |
|--------|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 0.0.0  | 0.0.2  | Replicate the schema of the LMS db.                                                                                                                                                                  |
| 0.0.3  | 0.0.7  | Insert reference records from the LMS db.                                                                                                                                                            |
| 0.0.8  | 0.0.14 | Insert dummy data: 2 branches and fos, a challenge, several users and one progress.                                                                                                                  |
| 0.0.15 | 0.0.19 | Add records for history submissions of a challenge. The repositories were provided on May 2, 2024, through [Google Drive](https://drive.google.com/drive/folders/1W95RV4uNcJ5GIejy92hsLIpGwO6MExiL). |
| 0.0.20 | 0.0.24 | Create tables for the anti-plagiarism system.                                                                                                                                                        |
| 0.0.25 | 0.0.25 | Insert an engine entry for Dolos 2.7.0.                                                                                                                                                              |
| 0.0.26 | 0.0.26 | Randomize the `createdAt` and `updatedAt` time of `progresses`.                                                                                                                                      |
| 0.0.27 | 0.0.27 | Remove `Pending` from the enum of column `status` of table `pc_plagiarism_check`. All records previously marked `Pending` are deleted.                                                               |
| 0.0.28 | 0.0.28 | Create table `pc_decision`.                                                                                                                                                                          |
| 0.0.29 | 0.0.30 | Update existing and insert new challenges.                                                                                                                                                           |
| 0.0.31 | 0.0.35 | Add records for history submissions of a challenge. The files were provided via Slack on July 12, 2024.                                                                                              |