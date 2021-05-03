<template>
  <v-data-table
    :headers="headers"
    :items="matches"
    sort-by="date"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Matches</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
              Add Match
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.date"
                      label="Match Date"
                      :rules="[v => !!v || 'This field is required']"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-select
                      :items="['win', 'lose', 'draw']"
                      v-model="editedItem.decision"
                      label="Result"
                      :rules="[v => !!v || 'This field is required']"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-select
                      :items="maps"
                      v-model="editedItem.map"
                      label="Map"
                      :rules="[v => !!v || 'This field is required']"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.mmr"
                      label="MMR"
                      :rules="[v => !!v || 'This field is required']"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.opponent"
                      label="Opponent's Name"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.opponentMmr"
                      label="Opponent's MMR"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-select
                      :items="['protoss', 'terran', 'zerg']"
                      v-model="editedItem.opponentRace"
                      label="Opponent's Race"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.youtubeLink"
                      label="Link to youtube"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">
                Cancel
              </v-btn>
              <v-btn color="blue darken-1" text @click="save">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="headline"
              >Are you sure you want to delete this match?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete"
                >Cancel</v-btn
              >
              <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon small @click="deleteItem(item)">
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { IMatchData } from "@/types/IMatchData";

export default Vue.extend({
  props: {
    collection: {
      type: String as
        | PropType<"harstemRoadRankOne">
        | PropType<"harstemGrandmasterTerran">
        | PropType<"harstemGrandmasterZerg">,
      required: true
    }
  },
  data: () => ({
    maps: [
      "2000 Atmospheres LE",
      "Beckett Industries LE",
      "Blackburn LE",
      "Jagannatha LE",
      "Lightshade LE",
      "Oxide LE",
      "Romanticide LE"
    ],
    dialog: false,
    dialogDelete: false,
    headers: [
      {
        text: "Match Date",
        align: "start",
        value: "date"
      },
      { text: "Decision", value: "decision" },
      { text: "Map", value: "map" },
      { text: "Mmr", value: "mmr" },
      { text: "Opponent's Name", value: "opponent" },
      { text: "Opponent's Mmr", value: "opponentMmr" },
      { text: "Opponent's Race", value: "opponentRace" },
      { text: "Link to Youtube", value: "youtubeLink" },
      { text: "Actions", value: "actions", sortable: false }
    ],
    matches: [] as IMatchData[],
    editedIndex: -1,
    editedItem: {
      date: 0,
      decision: "draw",
      map: "",
      mmr: 0,
      opponent: "",
      opponentMmr: 0,
      opponentRace: "protoss",
      youtubeLink: ""
    } as IMatchData,
    defaultItem: {
      date: 0,
      decision: "draw",
      map: "",
      mmr: 0,
      opponent: "",
      opponentMmr: 0,
      opponentRace: "protoss",
      youtubeLink: ""
    } as IMatchData
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    }
  },

  created() {
    this.initialize();
  },

  methods: {
    async initialize() {
      const snapshot = await this.$fire.firestore
        .collection(this.collection)
        .get();
      snapshot.forEach((match: any) => {
        const matchData: IMatchData = match.data();
        this.matches.push(matchData);
      });
    },

    editItem(item: IMatchData) {
      this.editedIndex = this.matches.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item: IMatchData) {
      this.editedIndex = this.matches.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    async deleteItemConfirm() {
      await this.$fire.firestore
        .collection(this.collection)
        .doc(this.editedItem.date.toString())
        .delete();
      this.matches = [];
      this.closeDelete();
      this.$nextTick(() => {
        this.initialize();
      });
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    async save() {
      await this.$fire.firestore
        .collection(this.collection)
        .doc(this.editedItem.date.toString())
        .set(this.editedItem);
      this.close();
      this.matches = [];
      this.$nextTick(() => {
        this.initialize();
      });
    }
  }
});
</script>

<style></style>
