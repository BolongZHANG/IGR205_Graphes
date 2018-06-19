import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.io.Reader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.TreeMap;
import java.util.TreeSet;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.search.Hits;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;

import com.sleepycat.je.Database;
import com.sleepycat.je.DatabaseConfig;
import com.sleepycat.je.DatabaseEntry;
import com.sleepycat.je.Environment;
import com.sleepycat.je.EnvironmentConfig;
import com.sleepycat.je.LockMode;
import com.sleepycat.je.OperationStatus;

import utils.FPInfo;
import utils.ItemInfo;
import utils.NeighborInfo;
import utils.HeapNode;

public class SummaryGraph {
	public static void main(String[] args) {
		try {
			String str = "";
			int cur_id = 0;
			String[] TermArr, TermArr1;

			String dir_index = "index";

			Date loadingStartTime = new Date();

			EnvironmentConfig envConfig1 = new EnvironmentConfig();
			envConfig1.setAllowCreate(true);
			Environment myDbEnvironment1 = new Environment(new File(dir_index + "/DistanceIndex"), envConfig1);

			// Open the database. Create it if it does not already exist.
			DatabaseConfig dbConfig1 = new DatabaseConfig();
			dbConfig1.setAllowCreate(true);
			Database myDatabase1 = myDbEnvironment1.openDatabase(null, "DistanceIndexDB", dbConfig1);

			System.out.println("loading RDF graph...");
			InputStream in = new FileInputStream(new File(dir_index + "/graph_adjacent_list.txt"));
			Reader inr = new InputStreamReader(in);
			BufferedReader br = new BufferedReader(inr);

			int neighbor_id = 0, label_id = 0, NodeNum = 0;
			int updateNum = 2;

			str = br.readLine();
			NodeNum = Integer.valueOf(str);

			NeighborInfo[][] adjacentList = new NeighborInfo[NodeNum][];

			System.out.println("loading adjacent list...");
			str = br.readLine();
			while (str != null) {

				str = str.trim();
				TermArr = str.split("\t");
				cur_id = Integer.valueOf(TermArr[0]);
				TermArr1 = TermArr[1].split(" ");
				// (neighbor_id, label_id, distance, direction)
				adjacentList[cur_id] = new NeighborInfo[TermArr1.length / 4];
				for (int i = 0; i < TermArr1.length; i = i + 4) {
					neighbor_id = Integer.valueOf(TermArr1[i]);
					label_id = Integer.valueOf(TermArr1[i + 1]);

					adjacentList[cur_id][i / 4] = new NeighborInfo(neighbor_id, label_id);
					adjacentList[cur_id][i / 4].Distance = Integer.valueOf(TermArr1[i + 2]);
					adjacentList[cur_id][i / 4].Direction = Integer.valueOf(TermArr1[i + 3]);
				}

				str = br.readLine();
			}

			br.close();

			System.out.println("loading Entity ID Map...");
			HashMap<Integer, String> IDEntityMap = new HashMap<Integer, String>();
			HashMap<String, Integer> EntityIDMap = new HashMap<String, Integer>();
			byte[] entityTagArr = new byte[NodeNum];

			InputStream in_entity = new FileInputStream(new File(dir_index + "/entity_id_map.txt"));
			Reader inr_entity = new InputStreamReader(in_entity);
			BufferedReader br_entity = new BufferedReader(inr_entity);

			str = br_entity.readLine();
			// entity tag: 1 means entities, 0 means data values
			Arrays.fill(entityTagArr, (byte) 0);

			while (str != null) {

				TermArr = str.split("\t");
				cur_id = Integer.valueOf(TermArr[0]);
				EntityIDMap.put(TermArr[1], cur_id);
				IDEntityMap.put(cur_id, TermArr[1]);

				if (TermArr[1].startsWith("<")) {
					entityTagArr[cur_id] = 1;
				}

				str = br_entity.readLine();
			}

			br_entity.close();

			System.out.println("loading distance-based index ...");
			InputStream in175 = new FileInputStream(new File(dir_index + "/pivot.txt"));
			Reader inr175 = new InputStreamReader(in175);
			BufferedReader br175 = new BufferedReader(inr175);

			str = br175.readLine();
			cur_id = 0;
			HashSet<Integer> RNSet = new HashSet<Integer>();

			while (str != null) {

				TermArr = str.split("\t");
				cur_id = Integer.valueOf(TermArr[0]);

				RNSet.add(cur_id);

				str = br175.readLine();
			}
			br175.close();

			System.out.println("loading structural index ...");
			InputStream in650 = new FileInputStream(new File(dir_index + "/p_weight.txt"));
			Reader inr650 = new InputStreamReader(in650);
			BufferedReader br650 = new BufferedReader(inr650);

			TreeMap<String, Integer> PredicateIDMap = new TreeMap<String, Integer>();
			TreeMap<Integer, String> IDPredicateMap = new TreeMap<Integer, String>();
			TreeMap<Integer, ItemInfo> IDItemMap = new TreeMap<Integer, ItemInfo>();
			TreeMap<Integer, Integer> LabelItemPosMap = new TreeMap<Integer, Integer>();
			int item_id = 0, p_id = 0;

			str = br650.readLine();
			while (str != null) {
				TermArr = str.split(" ");

				PredicateIDMap.put(TermArr[0], Integer.valueOf(TermArr[1]));
				IDPredicateMap.put(Integer.valueOf(TermArr[1]), TermArr[0]);

				p_id = Integer.valueOf(TermArr[1]);
				LabelItemPosMap.put(p_id, item_id);

				IDItemMap.put(item_id, new ItemInfo(p_id, 0, 1));
				IDItemMap.put((item_id + 1), new ItemInfo(p_id, 0, 2));
				IDItemMap.put((item_id + 2), new ItemInfo(p_id, 0, 3));

				IDItemMap.put((item_id + 3), new ItemInfo(p_id, 1, 1));
				IDItemMap.put((item_id + 4), new ItemInfo(p_id, 1, 2));
				IDItemMap.put((item_id + 5), new ItemInfo(p_id, 1, 3));

				item_id = item_id + 6;

				str = br650.readLine();
			}

			br650.close();

			InputStream in70 = new FileInputStream(new File(dir_index + "/fp.out"));
			Reader inr70 = new InputStreamReader(in70);
			BufferedReader br70 = new BufferedReader(inr70);
			TreeSet<Integer> frequentPropertySet = new TreeSet<Integer>();
			TreeSet<Integer> frequentItemSet = new TreeSet<Integer>();
			TreeMap<Integer, ArrayList<Integer>> ItemFPListMap = new TreeMap<Integer, ArrayList<Integer>>();
			ArrayList<FPInfo> fpList = new ArrayList<FPInfo>();
			int cur_frequency = 0;

			str = br70.readLine();
			while (str != null) {
				TermArr = str.split(":");

				TermArr1 = TermArr[0].split(" ");
				TreeSet<Integer> curItemSet = new TreeSet<Integer>();
				for (int i = 0; i < TermArr1.length; i++) {
					TermArr1[i] = TermArr1[i].trim();
					item_id = Integer.valueOf(TermArr1[i]);
					ItemInfo curItem = IDItemMap.get(item_id);
					frequentPropertySet.add(curItem.Label);
					frequentItemSet.add(item_id);

					curItemSet.add(item_id);
				}

				TermArr[1] = TermArr[1].trim();
				cur_frequency = Integer.valueOf(TermArr[1]);

				FPInfo newFP = new FPInfo(curItemSet, cur_frequency);

				if (fpList.size() == 0) {
					fpList.add(newFP);
				} else {
					int fp_tag = 0;
					for (int i = fpList.size() - 1; i >= 0; i--) {
						if (newFP.isSubFP(fpList.get(i))) {
							fp_tag = 1;
							break;
						}
					}
					if (fp_tag == 0) {
						fpList.add(newFP);
					}
				}

				str = br70.readLine();
			}

			br70.close();

			for (int i = 0; i < fpList.size(); i++) {
				int[] curItemArr = fpList.get(i).getItemArr();

				for (int j = 0; j < curItemArr.length; j++) {
					if (!ItemFPListMap.containsKey(curItemArr[j])) {
						ItemFPListMap.put(curItemArr[j], new ArrayList<Integer>());
					}
					ItemFPListMap.get(curItemArr[j]).add(i);
				}
			}

			Date loadingEndTime = new Date();
			System.out.print("loading time:");
			System.out.println(loadingEndTime.getTime() - loadingStartTime.getTime() + "ms");

			/**************** End of loading data ******************/

			System.out.println("begin to process keywords...");
			String fileStr = args[1];
			InputStream in1 = new FileInputStream(new File(fileStr));
			Reader inr1 = new InputStreamReader(in1);
			BufferedReader br1 = new BufferedReader(inr1);

			System.out.println(fileStr);
			Date currentTime1 = new Date();
			str = br1.readLine();
			System.out.println(str);
			TermArr = str.split(";");
			System.out.println(TermArr.length);
			int[][] visited = new int[TermArr.length][NodeNum];
			int[][] candidateDist = new int[TermArr.length][NodeNum];
			byte[] b = null;
			NeighborInfo[] TermArr2 = null;

			String[] keywordArr = new String[TermArr.length];
			for (int n = 0; n < keywordArr.length; n++) {
				TermArr[n] = TermArr[n].trim();
				keywordArr[n] = TermArr[n];

				Arrays.fill(visited[n], Integer.MAX_VALUE);
				Arrays.fill(candidateDist[n], Integer.MAX_VALUE);

				HashSet<Integer> visitedRNSet = new HashSet<Integer>();
				TreeSet<HeapNode> candidate = new TreeSet<HeapNode>();
				// ArrayList<Integer> keywordelementslist = new
				// ArrayList<Integer>();

				Hits hits = null;
				Query query = null;
				IndexSearcher searcher = new IndexSearcher(dir_index + "/LuceneIndex");
				Analyzer analyzer = new StandardAnalyzer();
				try {
					QueryParser qp = new QueryParser("body", analyzer);
					query = qp.parse(keywordArr[n]);
				} catch (ParseException e) {
				}
				if (searcher != null) {
					hits = searcher.search(query);

					for (int m = 0; m < hits.length(); m++) {

						String titleStr = hits.doc(m).getField("title").stringValue();
						cur_id = Integer.valueOf(titleStr);

						HeapNode curHeapNode = new HeapNode(cur_id);
						curHeapNode.Dist = 0;
						candidateDist[n][cur_id] = 0;

						candidate.add(curHeapNode);

					}

					while (candidate.size() != 0) {
						HeapNode curHeapNode = candidate.pollFirst();
						visited[n][curHeapNode.VertexID] = curHeapNode.Dist;

						if (RNSet.contains(curHeapNode.VertexID) && !visitedRNSet.contains(curHeapNode.VertexID)
								&& visitedRNSet.size() < updateNum) {

							String aKey = "" + curHeapNode.VertexID;
							DatabaseEntry theKey = new DatabaseEntry(aKey.getBytes("UTF-8"));
							DatabaseEntry theData = new DatabaseEntry();

							if (myDatabase1.get(null, theKey, theData, LockMode.DEFAULT) == OperationStatus.SUCCESS) {
								// Recreate the data String.
								b = theData.getData();
							}

							visitedRNSet.add(curHeapNode.VertexID);
							for (int k = 0; k < NodeNum; k++) {
								if (b[k] != -1) {
									HeapNode newHeapNode = new HeapNode(k);
									newHeapNode.Dist = b[k] + curHeapNode.Dist;

									if (candidateDist[n][k] != Integer.MAX_VALUE) {
										int cur_dist = candidateDist[n][k];
										if (newHeapNode.Dist < cur_dist) {
											candidateDist[n][k] = newHeapNode.Dist;
										}
									} else {
										candidateDist[n][k] = newHeapNode.Dist;
									}

								}
							}
							continue;
						}

						TermArr2 = adjacentList[curHeapNode.VertexID];
						for (int i = 0; i < TermArr2.length; i++) {

							if (visited[n][TermArr2[i].NeighborID] != Integer.MAX_VALUE)
								continue;
							if (entityTagArr[TermArr2[i].NeighborID] == 0)
								continue;

							if (candidateDist[n][TermArr2[i].NeighborID] != Integer.MAX_VALUE) {

								int cur_dist = candidateDist[n][TermArr2[i].NeighborID];
								if (TermArr2[i].Distance + curHeapNode.Dist < cur_dist) {
									HeapNode tempHeapNode = new HeapNode(TermArr2[i].NeighborID);
									tempHeapNode.Dist = cur_dist;
									candidate.remove(tempHeapNode);

									HeapNode newHeapNode = new HeapNode(TermArr2[i].NeighborID);
									newHeapNode.Dist = TermArr2[i].Distance + curHeapNode.Dist;
									candidate.add(newHeapNode);

									candidateDist[n][TermArr2[i].NeighborID] = TermArr2[i].Distance + curHeapNode.Dist;
								}
							} else {
								HeapNode newHeapNode = new HeapNode(TermArr2[i].NeighborID);
								newHeapNode.Dist = TermArr2[i].Distance + curHeapNode.Dist;
								candidate.add(newHeapNode);
								candidateDist[n][TermArr2[i].NeighborID] = TermArr2[i].Distance + curHeapNode.Dist;
							}
						}
					}

				}

			}

			System.out.print("keyword Dijkstra time:");
			Date currentTime2 = new Date();
			System.out.println(currentTime2.getTime() - currentTime1.getTime());

			boolean[] isLinked = new boolean[NodeNum];
			Arrays.fill(isLinked, false);
			int count = 0;
			for (int n = 0; n < keywordArr.length; n++) {
				for (int i = 0; i < NodeNum; i++) {
					if (candidateDist[n][i] < Integer.valueOf(args[2])) {
						isLinked[i] = true;
						count++;
					}
				}
			}
			System.out.println("total nodes: " + NodeNum);
			System.out.println("visible nodes to keywords: " + count);

			PrintStream out_summary = new PrintStream(new File(dir_index + "/summary.txt"));

			InputStream inFile = new FileInputStream(new File(args[0]));
			Reader inReader = new InputStreamReader(inFile);
			BufferedReader inBuffer = new BufferedReader(inReader);
			str = inBuffer.readLine();

			System.out.println("creating summary graph...");
			while (str != null) {
				str = str.trim();
				str = str.substring(0, str.length() - 1);
				str = str.trim();
				TermArr = str.split(" ");
				if (!(EntityIDMap.containsKey(TermArr[0]) && !isLinked[EntityIDMap.get(TermArr[0])]
						|| EntityIDMap.containsKey(TermArr[1]) && !isLinked[EntityIDMap.get(TermArr[1])]
						|| EntityIDMap.containsKey(TermArr[2]) && !isLinked[EntityIDMap.get(TermArr[2])])) {
					out_summary.println(str);
				}
				str = inBuffer.readLine();
			}

			out_summary.flush();
			out_summary.close();
			inBuffer.close();
			br1.close();
			myDatabase1.close();
			myDbEnvironment1.close();
			System.out.println("finished!");

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
