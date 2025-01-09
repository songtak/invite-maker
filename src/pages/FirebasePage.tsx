import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";

import { db } from "../../firebaseConfig";
import dayjs from "dayjs";
import _ from "lodash";

const FirebasePage = () => {
  const today = dayjs().format("YYYY-MM-DD");
  const [dataList, setDataList] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string[]>([today]);

  console.log("selectedDate", selectedDate);

  // Firestore 인스턴스와 컬렉션 참조를 설정
  const resultsRef = collection(db, "result-list");
  const filteredDocs: any = [];

  // 모든 문서를 가져옴
  if (dataList.length === 0) {
    getDocs(resultsRef)
      .then((snapshot) => {
        if (snapshot.empty) {
          console.log("No documents found.");
          return;
        }

        snapshot.forEach((doc) => {
          const data = doc.data();
          // check_date 필드의 앞 10자리가 '2025-01-07'인지 확인
          if (
            data.check_date &&
            selectedDate.map((item: string) => {
              const matched = data.check_date.startsWith(item);
              console.log("matched", matched === true ? true : undefined);

              return matched === true ? true : undefined;
            })
            // (data.check_date.startsWith("2025-01-07") ||
            //   data.check_date.startsWith("2025-01-08"))
          ) {
            filteredDocs.push({ id: doc.id, data: data });
            setDataList(filteredDocs);
          }
        });

        if (filteredDocs.length > 0) {
          // console.log("Filtered documents:", filteredDocs);
        } else {
          console.log("No documents match the date '2025-01-07'.");
        }
      })
      .catch((error) => {
        console.error("Error fetching documents: ", error);
      });
  }

  return (
    <>
      <div>tatal : {dataList.length}</div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Check Date</th>
            <th>Emojis</th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((document: any) => (
            <tr key={document.id}>
              <td>{document.data.date}</td>
              <td>{document.data.name}</td>
              <td>{document.data.check_date}</td>
              <td>{document.data.emojis}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default FirebasePage;
