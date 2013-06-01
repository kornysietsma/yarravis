(ns yarravis.data
  (:require [clojure.data.csv :as csv]
            [clojure.java.io :as io]
            [clojure.algo.generic.math-functions :as math]
            [clojure.tools.reader.edn :as edn]
            [cheshire.core :as json]))

(def precision 0.0000001)

(defn csv-to-maps [data]
  (let [headers (first data)
        rows (rest data)]
    (map #(zipmap headers %) rows)))

(defn read-data [name]
  (-> (str "data/" name)
      slurp
      (csv/read-csv :separator \tab)
      csv-to-maps))

(defn read-csv-data [name]
  (-> (str "data/" name)
      slurp
      csv/read-csv
      csv-to-maps))

(def numeric-field #{:Northing :Easting :Zone})

(defn parse-ll [s]
  (Double/parseDouble (first (clojure.string/split s #"\s"))))

(defn clean-water [w]
  (into {}
        (for [[k v] w]
          [(keyword k)
           (cond
            (#{:Longitude :Latitude} (keyword k)) (parse-ll v)
            (numeric-field (keyword k)) (Double/parseDouble v)
            :else v)])))

(defn water-data []
  (map clean-water (read-csv-data "waterdata.csv")))

(defn clean-loc [loc]
  {:desc (loc "Location desc from google")
   :desc2 (loc "location desc from data")
   :lat (Double/parseDouble (loc "lat"))
   :long (Double/parseDouble (loc "long"))})

(defn old-locations-data []
  (map clean-loc (read-data "locations.tsv")))

(def old-locations (memoize old-locations-data))

(defn clean-elevdata [ed]
  {:lat (Double/parseDouble (ed "lat"))
   :long (Double/parseDouble (ed "lng"))
   :elevation (Double/parseDouble (ed "elevation"))
   :resolution (Double/parseDouble (ed "resolution"))})

(defn elevation-data []
  (let [raw-data (read-data "sheet4.tsv")]
    (map clean-elevdata raw-data)))

(def elevations (memoize elevation-data))

(defn elevation [lat long]
  (let [results (filter
                 #(and (math/approx= lat (:lat %) precision)
                       (math/approx= long (:long %) precision)) (elevations))]
    (cond (= 1 (count results)) (first results)
          (< 1 (count results))
          (do (println (str (count results) " results for " lat " / " long))
              (first results))
          :else (do (println (str "no results for " lat " / " long))
              nil))))

(defn old-mapdata []
  (sort-by :long
           (map #(assoc % :elev (:elevation (elevation (:lat %) (:long %)))) (old-locations)))
  )

(defn water-elev []
  (sort-by :Longitude
           (map #(assoc % :elev (:elevation (elevation (:Latitude %) (:Longitude %)))) (water-data)))
  )

(defn locations []
  (into #{}
        (map #(select-keys % [:Latitude :Longitude]) (water-data))))

(defn google-elev [lat long]
  (println "asking google for " lat " / " long)
  (let [results (json/parse-string (slurp (format "http://maps.googleapis.com/maps/api/elevation/json?locations=%f,%f&sensor=false" lat long)) true)]
    (if (= "OK" (:status results))
      (:elevation (first (:results results)))
      (do (println "Bad results for " lat " / " long " : " results)
          nil))))

(def init-elevations (edn/read-string (slurp "data/elevations.clj")))

(def elevations (atom init-elevations))

(defn gelev [lat long]
  (if (@elevations [lat long])
    (@elevations [lat long])
    (do
      (swap! elevations #(assoc % [lat long] (google-elev lat long)))
      (@elevations [lat long]))))

#_(def gelev (memoize google-elev))

(defn water-elev []
  (sort-by :elevation
           (map #(assoc % :elevation (gelev (:Latitude %) (:Longitude %))) (water-data)))
  )

(defn water-grouped []
  (sort-by :elevation (group-by #(select-keys % [:Longitude :Latitude :elevation (keyword "Site Name")]) (water-elev))))
